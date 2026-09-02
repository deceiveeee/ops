import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

/**
 * Sign-up has two legitimate endings and the page cannot tell them apart by
 * assuming. Whether Supabase sends a confirmation email is a project setting:
 * with confirmations off it returns a live session and the account is already
 * usable, with them on it returns no session and the email is the next step.
 *
 * This project has confirmations off, and the page used to discard the response
 * entirely and always claim an email had been sent — so every learner who signed
 * up was told to go and wait for a message that was never sent, while they were
 * already signed in.
 */

const push = vi.fn();
const signUp = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams("next=/courses"),
}));

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowser: () => ({ auth: { signUp } }),
}));

import SignupPage from "./page";

function fillAndSubmit() {
  const email = document.querySelector<HTMLInputElement>('input[type="email"]')!;
  const password = document.querySelector<HTMLInputElement>('input[type="password"]')!;
  fireEvent.change(email, { target: { value: "learner@example.invalid" } });
  fireEvent.change(password, { target: { value: "a-long-enough-password" } });
  fireEvent.submit(email.closest("form")!);
}

describe("sign-up outcome", () => {
  beforeEach(() => {
    push.mockReset();
    signUp.mockReset();
  });

  it("sends the learner onward when the account is already usable", async () => {
    signUp.mockResolvedValue({
      data: { session: { access_token: "live" }, user: { id: "u1" } },
      error: null,
    });

    render(<SignupPage />);
    fillAndSubmit();

    await waitFor(() => expect(push).toHaveBeenCalledWith("/courses"));
    expect(screen.queryByText(/Check your email/i)).toBeNull();
  });

  it("asks for the email only when there is no session to use", async () => {
    signUp.mockResolvedValue({ data: { session: null, user: { id: "u1" } }, error: null });

    render(<SignupPage />);
    fillAndSubmit();

    await waitFor(() => expect(screen.getByText(/Check your email/i)).toBeTruthy());
    expect(push).not.toHaveBeenCalled();
  });

  it("shows a failure instead of either success screen", async () => {
    signUp.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: "User already registered" },
    });

    render(<SignupPage />);
    fillAndSubmit();

    await waitFor(() => expect(screen.getByText("User already registered")).toBeTruthy());
    expect(push).not.toHaveBeenCalled();
    expect(screen.queryByText(/Check your email/i)).toBeNull();
  });

  it("explains an unreachable service rather than quoting the browser", async () => {
    signUp.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: "Failed to fetch" },
    });

    render(<SignupPage />);
    fillAndSubmit();

    await waitFor(() =>
      expect(screen.getByText(/could not reach the sign-in service/i)).toBeTruthy(),
    );
    expect(screen.queryByText("Failed to fetch")).toBeNull();
  });
});
