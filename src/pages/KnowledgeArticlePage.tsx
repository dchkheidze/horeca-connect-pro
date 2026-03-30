import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, ArrowRight, Package, Wrench } from "lucide-react";
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
}

export default function KnowledgeArticlePage() {
  const { categorySlug, articleSlug } = useParams<{
    categorySlug: string;
    articleSlug: string;
  }>();
  const [post, setPost] = useState<Post | null>(null);
  const [category, setCategory] = useState<KnowledgeCategory | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [postRes, catRes] = await Promise.all([
        supabase
          .from("posts")
          .select("*")
          .eq("slug", articleSlug!)
          .eq("status", "PUBLISHED")
          .maybeSingle(),
        supabase
          .from("knowledge_categories")
          .select("*")
          .eq("slug", categorySlug!)
          .maybeSingle(),
      ]);

      const p = postRes.data as Post | null;
      setPost(p);
      setCategory(catRes.data as KnowledgeCategory | null);

      if (p) {
        document.title = `${p.title} — Knowledge Center — HoReCa Hub`;
        // Fetch related posts in same category
        const { data: related } = await supabase
          .from("posts")
          .select("*")
          .eq("status", "PUBLISHED")
          .eq("category", p.category || "")
          .neq("id", p.id)
          .limit(4);
        setRelatedPosts((related || []) as Post[]);
      }
      setLoading(false);
    };
    fetchData();
  }, [articleSlug, categorySlug]);

  if (loading) {
    return (
      <div className="container py-12">
        <div className="h-6 w-32 rounded bg-muted animate-pulse mb-6" />
        <div className="h-10 w-3/4 rounded bg-muted animate-pulse mb-4" />
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Article not found</h1>
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
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main Content */}
        <article className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/knowledge" className="hover:text-primary">
              Knowledge Center
            </Link>
            <span>/</span>
            {category && (
              <>
                <Link
                  to={`/knowledge/${category.slug}`}
                  className="hover:text-primary"
                >
                  {category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-foreground truncate">{post.title}</span>
          </nav>

          {/* Meta */}
          <div className="flex items-center gap-3 mb-4">
            {category && (
              <Badge variant="secondary">{category.name}</Badge>
            )}
            {post.read_time && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {post.read_time} min read
              </span>
            )}
            <span className="text-sm text-muted-foreground">
              {format(
                new Date(post.published_at || post.created_at),
                "MMMM d, yyyy"
              )}
            </span>
          </div>

          <h1 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-6">
            {post.title}
          </h1>

          {/* Hero image */}
          <div className="aspect-[16/9] overflow-hidden rounded-xl mb-8">
            <img
              src={post.cover_image || pickImage(UNSPLASH.blog, post.id)}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none text-foreground">
            {post.content?.split("\n").map((paragraph, i) =>
              paragraph.trim() ? (
                <p key={i}>{paragraph}</p>
              ) : (
                <br key={i} />
              )
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </article>

        {/* Sidebar */}
        <aside className="lg:w-80 shrink-0 space-y-6">
          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-heading font-semibold text-foreground mb-4">
                  Related Articles
                </h3>
                <div className="space-y-3">
                  {relatedPosts.map((rp) => (
                    <Link
                      key={rp.id}
                      to={`/knowledge/${rp.category || "general"}/${rp.slug}`}
                      className="block group"
                    >
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {rp.title}
                      </p>
                      {rp.read_time && (
                        <span className="text-xs text-muted-foreground">
                          {rp.read_time} min read
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Marketplace Links */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-heading font-semibold text-foreground">
                Find Partners
              </h3>
              <Link
                to="/suppliers"
                className="flex items-center gap-3 p-3 rounded-lg bg-background hover:shadow-sm transition-shadow group"
              >
                <Package className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">
                    Browse Suppliers
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Verified food & equipment suppliers
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link
                to="/service-providers"
                className="flex items-center gap-3 p-3 rounded-lg bg-background hover:shadow-sm transition-shadow group"
              >
                <Wrench className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">
                    Browse Services
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Professional HoReCa services
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
