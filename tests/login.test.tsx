import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
vi.mock("@/lib/supabase/client", () => ({ createClient: () => null }));
import Login from "@/app/login/page";
it("shows configuration errors and never pretends to sign in", async () => {
  render(<Login />);
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Email"), "a@example.test");
  await user.type(screen.getByLabelText("Password"), "password123");
  await user.click(screen.getByRole("button", { name: "Sign in" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Configure NEXT_PUBLIC_SUPABASE_URL",
  );
});
it("does not expose public registration", async () => {
  render(<Login />);
  expect(
    screen.queryByRole("button", { name: /Create.*account/i }),
  ).not.toBeInTheDocument();
  expect(screen.getByText(/Registration is closed/)).toBeInTheDocument();
});
