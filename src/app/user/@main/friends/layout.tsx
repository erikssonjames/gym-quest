import Navbar from "./_components/navbar";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}
