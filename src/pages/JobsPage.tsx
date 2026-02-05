import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { jobs, jobCategories, jobTypes } from "@/data/mockData";
import { Search, MapPin, Clock, Banknote, ArrowRight, Briefcase } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedType, setSelectedType] = useState("All Types");

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Categories" || job.category === selectedCategory;
    const matchesType = selectedType === "All Types" || job.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="py-8 lg:py-12">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold lg:text-4xl mb-2">
            Hospitality Jobs
          </h1>
          <p className="text-lg text-muted-foreground">
            Find your next opportunity in the HoReCa industry.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs or companies..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <span className="text-sm font-medium">Category:</span>
            <div className="flex flex-wrap gap-2">
              {jobCategories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <span className="text-sm font-medium">Type:</span>
            <div className="flex flex-wrap gap-2">
              {jobTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card
              key={job.id}
              className="group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={job.companyLogo}
                      alt={`${job.company} logo`}
                      className="h-14 w-14 rounded-lg object-cover border border-border flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-heading text-lg font-semibold group-hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-muted-foreground">{job.company}</p>
                        </div>
                        <Badge
                          variant={job.type === "Full-time" ? "default" : "secondary"}
                          className="flex-shrink-0"
                        >
                          {job.type}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Banknote className="h-4 w-4" />
                          {job.salary}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {job.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" asChild className="flex-shrink-0">
                    <Link to={`/jobs/${job.slug}`}>
                      View Job
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No jobs found matching your criteria.</p>
            <Button
              variant="link"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Categories");
                setSelectedType("All Types");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* CTA */}
        <Card className="mt-12 hero-gradient text-primary-foreground">
          <CardContent className="p-8 text-center">
            <h2 className="font-heading text-2xl font-bold mb-3">
              Looking to hire hospitality talent?
            </h2>
            <p className="text-primary-foreground/80 mb-6 max-w-lg mx-auto">
              Post your job openings and reach thousands of qualified candidates in the HoReCa industry.
            </p>
            <Button variant="accent" size="lg" asChild>
              <Link to="/auth/register?role=restaurant">
                Post a Job
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
