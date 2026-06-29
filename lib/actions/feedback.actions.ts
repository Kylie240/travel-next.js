"use server";

import createClient from "@/utils/supabase/server";
import { sendFeedbackNotificationEmail } from "@/lib/email";

export type SubmitFeedbackInput = {
  editing: boolean;
  saving: boolean;
  navigation: boolean;
  performance: boolean;
  interface: boolean;
  functionality: boolean;
  feature: boolean;
  account: boolean;
  sharing: boolean;
  responsiveness: boolean;
  other: boolean;
  comment: string;
  rating: number | null;
  selectedIssues: string[];
};

export async function submitUserFeedback(input: SubmitFeedbackInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase.from("users_feeback").insert([
    {
      user_id: user.id,
      editing: input.editing,
      saving: input.saving,
      navigation: input.navigation,
      performance: input.performance,
      interface: input.interface,
      functionality: input.functionality,
      feature: input.feature,
      account: input.account,
      sharing: input.sharing,
      responsiveness: input.responsiveness,
      other: input.other,
      comment: input.comment,
      rating: input.rating,
    },
  ]);

  if (error) {
    throw new Error(error.message);
  }

  const { data: profile } = await supabase
    .from("users")
    .select("name, username")
    .eq("id", user.id)
    .maybeSingle();

  const emailResult = await sendFeedbackNotificationEmail({
    submitterUserId: user.id,
    submitterEmail: user.email,
    submitterName: profile?.name ?? null,
    submitterUsername: profile?.username ?? null,
    rating: input.rating,
    selectedIssues: input.selectedIssues,
    comment: input.comment,
  });

  if (!emailResult.success) {
    console.warn(
      "Feedback saved but notification email failed:",
      emailResult.error
    );
  }

  return { success: true };
}
