import Navbar from "./_components/navbar";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-4">
      <Navbar />
      {children}
    </div>
  );
}
