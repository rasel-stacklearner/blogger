import PostSection from "@/components/PostSection";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Latest Posts</h1>
        <div className="space-x-4">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800">
            Admin Dashboard
          </Link>
        </div>
      </div>

      <PostSection />
    </div>
  );
}
