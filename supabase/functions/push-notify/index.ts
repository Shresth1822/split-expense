// @ts-nocheck
// Follow this setup guide to integrate with Supabase:
// https://supabase.com/docs/guides/functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "https://esm.sh/web-push@3.6.3";

console.log("Push Notification Function Started");

// Configure Web Push with your VAPID keys
// You must set these in your Supabase Dashboard -> Edge Functions -> Secrets
const vapidEmail = Deno.env.get("VAPID_EMAIL") || "mailto:admin@example.com";
const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
}

serve(async (req) => {
  const { record } = await req.json();

  // Only process if it's a new expense
  if (!record || !record.description) {
    return new Response(JSON.stringify({ message: "No record data" }), {
      status: 200,
    });
  }

  // Initialize Supabase Admin Client
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    // 1. Identify who should receive the notification
    // Logic: If group_id exists, notify all other members of the group
    let userIdsToNotify = [];

    if (record.group_id) {
      const { data: members, error: memberError } = await supabaseAdmin
        .from("group_members")
        .select("user_id")
        .eq("group_id", record.group_id)
        .neq("user_id", record.created_by); // Don't notify the creator

      if (!memberError && members) {
        userIdsToNotify = members.map((m) => m.user_id);
      }
    } else {
      // If no group (e.g. settlement), maybe notify the payer/payee?
      // This logic can be expanded.
    }

    if (userIdsToNotify.length === 0) {
      return new Response(JSON.stringify({ message: "No users to notify" }), {
        status: 200,
      });
    }

    // 2. Fetch subscriptions for these users
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from("push_subscriptions")
      .select("*")
      .in("user_id", userIdsToNotify);

    if (subError || !subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No subscriptions found" }),
        { status: 200 },
      );
    }

    // 3. Send Notifications
    const notificationPayload = JSON.stringify({
      title: "New Expense Added",
      body: `${record.description}: ₹${record.amount}`,
      url: `/groups/${record.group_id || ""}`, // Deep link
    });

    const promises = subscriptions.map((sub) => {
      // The keys stored in DB might need parsing if stored as JSONB
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: sub.keys,
      };

      return webpush
        .sendNotification(pushSubscription, notificationPayload)
        .catch((err) => {
          if (err.statusCode === 410) {
            // Subscription expired, delete from DB
            console.log(`Subscription expired for ${sub.user_id}, deleting...`);
            return supabaseAdmin
              .from("push_subscriptions")
              .delete()
              .eq("id", sub.id);
          }
          console.error("Error sending push:", err);
        });
    });

    await Promise.all(promises);

    return new Response(
      JSON.stringify({ message: `Sent ${promises.length} notifications` }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});
