// Force dynamic rendering — skip static prerendering for this route
// because it depends on runtime Supabase environment variables
export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
