import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, FileText } from "lucide-react";
import { UNSPLASH, pickImage } from "@/lib/unsplash";
import { format } from "date-fns";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  read_time: number | null;
  tags: string[] | null;
  published_at: string | null;
  created_at: string;
  cover_image: string | null;
}

interface KnowledgeCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export default function KnowledgeCategoryPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [category, setCategory] = useState<KnowledgeCategory | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, postsRes] = await Promise.all([
        supabase
          .from("knowledge_categories")
          .select("*")
          .eq("slug", categorySlug!)
          .maybeSingle(),
        supabase
          .from("posts")
          .select("*")
          .eq("status", "PUBLISHED")
          .eq("category", categorySlug!)
          .order("published_at", { ascending: false }),
      ]);

      if (catRes.data) {
        setCategory(catRes.data as KnowledgeCategory);
        document.title = `${catRes.data.name} — Knowledge Center — HoReCa Hub`;
      }
      setPosts((postsRes.data || []) as Post[]);
      setLoading(false);
    };
    fetchData();
  }, [categorySlug]);

  const sortedPosts =
    sortBy === "oldest" ? [...posts].reverse() : posts;

  if (loading) {
    return (
      <div className="container py-12">
        <div className="h-8 w-48 rounded bg-muted animate-pulse mb-4" />
        <div className="h-5 w-96 rounded bg-muted animate-pulse mb-8" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Category not found</h1>
        <Button asChild variant="outline">
          <Link to="/knowledge">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Knowledge Center
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/knowledge"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Knowledge Center
        </Link>
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-muted-foreground mb-3">{category.description}</p>
        )}
        <p className="text-sm text-muted-foreground">
          {posts.length} article{posts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Sort */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={sortBy === "newest" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("newest")}
        >
          Newest
        </Button>
        <Button
          variant={sortBy === "oldest" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("oldest")}
        >
          Oldest
        </Button>
      </div>

      {/* Articles */}
      {sortedPosts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-1">No articles yet</p>
            <p className="text-sm text-muted-foreground">
              Content for this category is coming soon.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {sortedPosts.map((post) => (
            <Link key={post.id} to={`/knowledge/${categorySlug}/${post.slug}`}>
              <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg group">
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={post.cover_image || pickImage(UNSPLASH.blog, post.id)}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    {post.read_time && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {post.read_time} min read
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {format(
                        new Date(post.published_at || post.created_at),
                        "MMM d, yyyy"
                      )}
                    </span>
                  </div>
                  <h3 className="font-heading font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt || post.content?.substring(0, 120) || ""}
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
