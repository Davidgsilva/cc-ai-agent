import { getUser } from "@/lib/dal";
import MainLayout from "../components/layout/MainLayout";

export default async function Home() {
  // This will automatically redirect to /login if not authenticated
  const user = await getUser();
  
  return <MainLayout />;
}
