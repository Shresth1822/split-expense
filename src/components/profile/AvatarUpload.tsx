import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export function AvatarUpload() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  // Actually, useAuth provides `user` object from Supabase Auth.
  // We should fetch the `profiles` row to get the correct `avatar_url` or use the one in metadata if we sync it.
  // Let's assume we rely on the `profiles` table which we can fetch.

  // Actually, let's just use the `user?.user_metadata?.avatar_url` if we updated it, or fetch it.
  // Better to fetch real-time profile data.

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("No user");

      setUploading(true);
      try {
        const fileExt = file.name.split(".").pop();
        const filePath = `${user.id}/${Math.random()}.${fileExt}`;

        // 1. Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath);

        // 3. Update Profile
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ avatar_url: publicUrl })
          .eq("id", user.id);

        if (updateError) throw updateError;

        // 4. Update Auth Metadata (optional but good for sync)
        await supabase.auth.updateUser({
          data: { avatar_url: publicUrl },
        });

        return publicUrl;
      } finally {
        setUploading(false);
      }
    },
    onSuccess: () => {
      toast.success("Avatar updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      // Reload window to reflect auth changes or update context manually?
      // Auth listener should pick it up if we updated user.
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];
    uploadAvatarMutation.mutate(file);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div
        className="relative group cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
          <AvatarImage
            src={user?.user_metadata?.avatar_url || ""}
            className="object-cover"
          />
          <AvatarFallback className="text-4xl">
            {user?.email?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
          <Pencil className="text-white h-8 w-8" />
        </div>
      </div>

      <div className="text-center">
        <h3 className="font-medium text-lg">
          {user?.user_metadata?.full_name}
        </h3>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>

      <input
        type="file"
        id="avatar"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />

      {uploading && (
        <div className="flex items-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Uploading...
        </div>
      )}
    </div>
  );
}
