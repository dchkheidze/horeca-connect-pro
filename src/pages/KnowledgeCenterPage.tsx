import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Settings, TrendingUp, Users, ChefHat, Package,
  Megaphone, Heart, Shield, Laptop, FileText, Clock, ArrowRight,
} from "lucide-react";
import { UNSPLASH, pickImage } from "@/lib/unsplash";
import { format } from "date-fns";

const ICON_MAP: Record<string, React.ElementType> = {
  Settings, TrendingUp, Users, ChefHat, Package,
  Megaphone, Heart, Shield, Laptop, FileText,
};

const POPULAR_TOPICS = [
  "Food Cost", "Supplier Selection", "Staff Hiring",
  "Menu Pricing", "Restaurant Marketing", "POS Systems",
];

interface KnowledgeCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string;
  sort_order: number;
  article_count?: number;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  read_time: number | null;
  is_featured: boolean | null;
  tags: string[] | null;
  published_at: string | null;
  created_at: string;
  status: string;
}

export default function KnowledgeCenterPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Knowledge Center — HoReCa Hub";
    const fetchData = async () => {
      const [catRes, postsRes] = await Promise.all([
        supabase.from("knowledge_categories").select("*").order("sort_order"),
        supabase
          .from("posts")
          .select("*")
          .eq("status", "PUBLISHED")
          .order("published_at", { ascending: false }),
      ]);

      const cats = (catRes.data || []) as KnowledgeCategory[];
      const posts = (postsRes.data || []) as Post[];

      // Count articles per category
      const countMap: Record<string, number> = {};
      posts.forEach((p) => {
        if (p.category) countMap[p.category] = (countMap[p.category] || 0) + 1;
      });
      cats.forEach((c) => (c.article_count = countMap[c.slug] || 0));

      setCategories(cats);
      setFeaturedPosts(posts.filter((p) => p.is_featured).slice(0, 4));
      setLatestPosts(posts.slice(0, 6));
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/knowledge/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getCategoryName = (slug: string | null) =>
    categories.find((c) => c.slug === slug)?.name || slug || "";

  if (loading) {
    return (
      <div className="container py-16">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <div className="h-10 w-64 mx-auto rounded bg-muted animate-pulse mb-4" />
          <div className="h-5 w-96 mx-auto rounded bg-muted animate-pulse" />
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b bg-secondary/30 py-16">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-3">
            Knowledge Center
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Practical insights, guides, and tools for restaurant owners and HoReCa professionals
          </p>
          <form onSubmit={handleSearch} className="relative mx-auto max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              className="h-12 pl-12 pr-4 rounded-xl text-base border-border/60 bg-background shadow-sm"
              placeholder="Search topics (e.g. food cost, suppliers, staff management)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </section>

      {/* Category Grid */}
      <section className="container py-12">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const Icon = ICON_MAP[cat.icon_name] || FileText;
            return (
              <Link key={cat.id} to={`/knowledge/${cat.slug}`}>
                <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/20 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-heading font-semibold text-foreground mb-1">
                          {cat.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                          {cat.description}
                        </p>
                        {cat.article_count! > 0 ? (
                          <span className="text-xs font-medium text-primary">
                            {cat.article_count} article{cat.article_count !== 1 ? "s" : ""}
                          </span>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Coming soon
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Insights */}
      {featuredPosts.length > 0 && (
        <section className="bg-secondary/30 py-12">
          <div className="container">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
              Featured Insights
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/knowledge/${post.category || "general"}/${post.slug}`}
                >
                  <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg group">
                    <div className="aspect-[16/9] overflow-hidden">
                      <img
                        src={pickImage(UNSPLASH.blog, post.id)}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        {post.category && (
                          <Badge variant="secondary" className="text-xs">
                            {getCategoryName(post.category)}
                          </Badge>
                        )}
                        {post.read_time && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {post.read_time} min read
                          </span>
                        )}
                      </div>
                      <h3 className="font-heading font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
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
          </div>
        </section>
      )}

      {/* Popular Topics */}
      <section className="container py-12">
        <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
          Popular Topics
        </h2>
        <div className="flex flex-wrap gap-2">
          {POPULAR_TOPICS.map((topic) => (
            <Badge
              key={topic}
              variant="outline"
              className="cursor-pointer px-4 py-2 text-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              onClick={() => setSearchQuery(topic)}
            >
              {topic}
            </Badge>
          ))}
        </div>
      </section>

      {/* Latest Articles */}
      {latestPosts.length > 0 && (
        <section className="border-t bg-secondary/20 py-12">
          <div className="container">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
              Latest Articles
            </h2>
            <div className="space-y-4">
              {latestPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/knowledge/${post.category || "general"}/${post.slug}`}
                >
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {post.category && (
                          <Badge variant="secondary" className="text-xs">
                            {getCategoryName(post.category)}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {format(
                            new Date(post.published_at || post.created_at),
                            "MMM d, yyyy"
                          )}
                        </span>
                      </div>
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                        {post.excerpt || post.content?.substring(0, 100) || ""}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1 group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container py-16">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 p-8">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
                Looking for suppliers or services?
              </h2>
              <p className="text-muted-foreground">
                Explore verified partners for your restaurant
              </p>
            </div>
            <Button asChild size="lg">
              <Link to="/suppliers">
                Browse Marketplace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
