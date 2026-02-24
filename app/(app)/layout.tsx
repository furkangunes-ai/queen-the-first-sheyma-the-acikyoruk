import { BinderLayout } from "@/components/layout/binder-layout";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BinderLayout>{children}</BinderLayout>;
}
