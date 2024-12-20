import Link from "next/link";

interface Author {
  id: string;
  name: string;
  email: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
  };
}

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: Author;
  comments: Comment[];
}

async function getPost(id: string): Promise<Post> {
  console.log("EnV", process.env.NEXT_PUBLIC_BACKEND_URL);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/posts/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch post");
  }

  return response.json();
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const post = await getPost(id);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/"
        className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
      >
        ← Back to Posts
      </Link>

      <article className=" rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center text-gray-600 mb-6">
          <span className="font-medium">{post.author.name}</span>
          <span className="mx-2">•</span>
          <time>{new Date(post.createdAt).toLocaleDateString()}</time>
        </div>
        <p className=" whitespace-pre-wrap mb-8 text-gray-300">
          {post.content}
        </p>
      </article>
    </div>
  );
}
