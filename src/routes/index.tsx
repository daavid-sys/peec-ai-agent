import { createFileRoute, redirect } from "@tanstack/react-router";
import { store } from "@/lib/store";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (!store.getState().connected) {
      store.loadDemoProject();
    }
    throw redirect({ to: "/project" });
  },
});
