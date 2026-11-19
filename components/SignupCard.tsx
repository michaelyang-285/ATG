"use client";
import BusinessLocationFields from "./BusinessLocationFields";
import { eligibleLocation, areaError } from "@/lib/directory/business-location";
import type { ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
export type SignupDetails = {
  city?: string;
  zip?: string;
  firstName: string;
  lastName: string;
  phone: string;
  name: string;
};
type Props = {
  event?: boolean;
  generalAccount?: boolean;
  client: SupabaseClient;
  signin: boolean;
  setSignin: (v: boolean) => void;
  sent: boolean;
  setSent: (v: boolean) => void;
  email: string;
  setEmail: (v: string) => void;
  googleEnabled: boolean;
  busy: boolean;
  account: SignupDetails;
  setAccount: (v: SignupDetails) => void;
  status: ReactNode;
  setMsg: (v: string) => void;
  run: (fn: () => Promise<void>) => Promise<void>;
  sendEmail: () => Promise<void>;
};
export function Completion({
  completed,
  total = 6,
}: {
  completed: number;
  total?: number;
}) {
  const percent = Math.round((100 * completed) / total);
  return (
    <div className="listing-completion">
      <div>
        <span>
          {completed === total
            ? "Listing details complete"
            : `Step ${completed + 1} of ${total}`}
        </span>
        <strong>{percent}% complete</strong>
      </div>
      <progress aria-label="Setup completion" max={100} value={percent}>
        {percent}%
      </progress>
    </div>
  );
}
export default function SignupCard({
  event = false,
  generalAccount = false,
  client,
  signin,
  setSignin,
  sent,
  setSent,
  email,
  setEmail,
  googleEnabled,
  busy,
  account,
  setAccount,
  status,
  setMsg,
  run,
  sendEmail,
}: Props) {
  function checkLocation() {
    if (!event && !signin && !eligibleLocation(account.city, account.zip)) throw Error(areaError);
  }
  return (
    <section className={generalAccount ? undefined : "signup-layout"}>
      {!generalAccount && <aside className="signup-intro">
        <a href={event ? "/events" : "/directory"}>
          ← {event ? "Events" : "Directory"}
        </a>
        <h1>
          {signin
            ? "Welcome back."
            : event
              ? "Submit a Gwinnett event."
              : "Get listed in Gwinnett."}
        </h1>
        <p>
          {signin
            ? event
              ? "Sign in to submit your event."
              : "Pick up where you left off or manage a published listing."
            : event
              ? "Help neighbors discover what’s happening in Gwinnett."
              : "Help neighbors find your business, services, or organization."}
        </p>
        <p className="fee-note">
          {event
            ? "Create your free account, then add your event details for review."
            : "Free to create an account. The one-time $3 listing fee comes at the end."}
        </p>
      </aside>}
      <div className="signup-card">
        {!generalAccount && !signin && <Completion completed={0} total={event ? 2 : 6} />}
        {sent ? (
          <>
            <h2>Check your inbox</h2>
            <p>
              Open the link sent to <strong>{email}</strong> to continue.
            </p>
            <button onClick={() => setSent(false)}>
              Change email or resend
            </button>
          </>
        ) : (
          <>
            <h2>{signin ? "Sign in" : "Create your account"}</h2>
            {!signin && !event && <fieldset className="account-grid">
              <legend>Business location</legend>
              <BusinessLocationFields city={account.city || ""} zip={account.zip || ""}
                onChange={(key, value) => setAccount({...account, [key]: value})} />
            </fieldset>}
            {googleEnabled && (
              <>
                <style jsx>{`
                  :global(.directory-owner) button.google-auth {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    min-height: 40px;
                    padding: 0 12px;
                    border: 1px solid #747775;
                    border-radius: 4px;
                    background: #fff;
                    color: #1f1f1f;
                    font:
                      500 14px/20px Roboto,
                      Arial,
                      sans-serif;
                    letter-spacing: 0.25px;
                    cursor: pointer;
                  }
                  :global(.directory-owner) button.google-auth:hover {
                    background: #f8faff;
                  }
                  :global(.directory-owner) button.google-auth:focus-visible {
                    outline: 2px solid #0b57d0;
                    outline-offset: 2px;
                  }
                  :global(.directory-owner) button.google-auth:disabled {
                    opacity: 0.6;
                    cursor: wait;
                  }
                `}</style>
                <button
                  className="google-auth"
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      checkLocation();
                      if (!event && !signin) sessionStorage.setItem("atg-directory-location", JSON.stringify({city: account.city, zip: account.zip}));
                      const { error } = await client.auth.signInWithOAuth({
                        provider: "google",
                        options: {
                          redirectTo: new URL(
                            generalAccount ? "/create-account" : event ? "/events/submit" : "/directory/manage",
                            window.location.origin,
                          ).href,
                          queryParams: { prompt: "select_account" },
                          scopes: "openid email profile",
                        },
                      });
                      if (error) throw error;
                    })
                  }
                >
                  <svg
                    aria-hidden="true"
                    width="20"
                    height="20"
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
                <p className="auth-divider">or use email</p>
              </>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                run(async () => {
                  checkLocation();
                  await sendEmail();
                  setSent(true);
                });
              }}
            >
              <div className="account-grid">
                {(
                  [
                    ["firstName", "First name", "given-name", "text"],
                    ["lastName", "Last name", "family-name", "text"],
                    ["email", "Email address", "email", "email"],
                    ["phone", "Phone number", "tel", "tel"],
                    [
                      "name",
                      "Business or organization name",
                      "organization",
                      "text",
                    ],
                  ] as const
                )
                  .filter(([k]) =>
                    signin
                      ? k === "email"
                      : !event ||
                        ["firstName", "lastName", "email"].includes(k),
                  )
                  .map(([k, label, auto, type]) => (
                    <label
                      key={k}
                      className={
                        k === "firstName" || k === "lastName" ? "" : "wide"
                      }
                    >
                      {label}
                      <input
                        required
                        autoComplete={auto}
                        type={type}
                        maxLength={k === "email" ? 254 : 240}
                        value={k === "email" ? email : account[k]}
                        onChange={(e) =>
                          k === "email"
                            ? setEmail(e.target.value)
                            : setAccount({ ...account, [k]: e.target.value })
                        }
                      />
                    </label>
                  ))}
              </div>
              {!signin && (
                <p className="quiet">
                  {generalAccount ? "We’ll email you a secure link to confirm your account." : event
                    ? "Your email stays private. You’ll choose a public organizer name on the next step."
                    : "Your name, phone, and email stay private. You’ll choose public contact details later."}
                </p>
              )}
              <button className="primary-action" disabled={busy}>
                {busy
                  ? "Sending…"
                  : signin
                    ? "Email me a sign-in link"
                    : "Create account"}
              </button>
            </form>
            <button
              className="text-action"
              onClick={() => {
                setSignin(!signin);
                setMsg("");
              }}
            >
              {signin
                ? "New here? Create an account"
                : "Already have an account? Sign in"}
            </button>
          </>
        )}
        {status}
      </div>
    </section>
  );
}
