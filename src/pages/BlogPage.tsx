import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { UNSPLASH, pickImage } from "@/lib/unsplash";
import { format } from "date-fns";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  published_at: string | null;
  created_at: string;
  status: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "PUBLISHED")
        .order("published_at", { ascending: false });

      if (!error && data) setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold">Blog</h1>
        <p className="mt-2 text-muted-foreground">
          Latest news, tips, and insights for the hospitality industry.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-3/4 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-2/3 rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium text-muted-foreground">No posts yet</p>
            <p className="text-sm text-muted-foreground">Check back soon for new content.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`}>
              <Card className="h-full transition-shadow hover:shadow-lg overflow-hidden">
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={pickImage(UNSPLASH.blog, post.id)}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <CardHeader>
                    <Calendar className="h-3.5 w-3.5" />
                    {post.published_at
                      ? format(new Date(post.published_at), "MMM d, yyyy")
                      : format(new Date(post.created_at), "MMM d, yyyy")}
                  </div>
                  <CardTitle className="text-lg leading-snug">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {post.excerpt || post.content?.substring(0, 150) || ""}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
