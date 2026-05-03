import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Truck, Briefcase, ArrowRight, CheckCircle2, Star } from "lucide-react";
import { UNSPLASH } from "@/lib/unsplash";

const roleCards = [
  {
    icon: Building2,
    title: "რესტორნებისთვის",
    description: "იპოვეთ სანდო მომწოდებლები, გამოაქვეყნეთ ვაკანსიები და გაამარტივეთ შესყიდვები. დაუკავშირდით დადასტურებულ პარტნიორებს, რომლებიც იცნობენ სასტუმრო-რესტორნის სფეროს.",
    features: ["წვდომა მომწოდებლების ბაზარზე", "ვაკანსიების გამოქვეყნება", "მომწოდებლებთან ურთიერთობების მართვა"],
    cta: "დაიწყეთ როგორც რესტორანი",
    href: "/auth/register?role=restaurant",
    color: "bg-primary",
    image: UNSPLASH.restaurant,
  },
  {
    icon: Truck,
    title: "მომწოდებლებისთვის",
    description: "მიაღწიეთ რესტორნებსა და სასტუმროებს, რომლებიც აქტიურად ეძებენ თქვენს პროდუქტებსა და მომსახურებას. გაზარდეთ თქვენი B2B კლიენტთა ბაზა.",
    features: ["დაარეგისტრირეთ თქვენი ბიზნესი", "დაუკავშირდით მყიდველებს", "მიიღეთ ფასის მოთხოვნები"],
    cta: "შემოგვიერთდით როგორც მომწოდებელი",
    href: "/auth/register?role=supplier",
    color: "bg-supplier",
    image: UNSPLASH.supplier,
  },
  {
    icon: Briefcase,
    title: "სამუშაოს მაძიებლებისთვის",
    description: "აღმოაჩინეთ შესაძლებლობები სასტუმრო-რესტორნის სფეროში. შეფ-მზარეულის პოზიციებიდან დარბაზის მომსახურების როლებამდე საუკეთესო დაწესებულებებში.",
    features: ["შერჩეული ვაკანსიების დათვალიერება", "მარტივი განაცხადები", "კარიერული რესურსები"],
    cta: "იპოვეთ თქვენი შემდეგი სამუშაო",
    href: "/auth/register?role=jobseeker",
    color: "bg-jobseeker",
    image: UNSPLASH.jobseeker,
  },
];

const stats = [
  { value: "2,500+", label: "დადასტურებული მომწოდებელი" },
  { value: "10,000+", label: "აქტიური ვაკანსია" },
  { value: "50,000+", label: "რესტორანი" },
  { value: "98%", label: "კმაყოფილების მაჩვენებელი" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0">
          <img
            src={UNSPLASH.hero}
            alt="Elegant restaurant interior"
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-primary/80" />
        </div>
        
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl animate-fade-in">
              B2B პლატფორმა
              <span className="block mt-2">სასტუმრო-რესტორნის პროფესიონალებისთვის</span>
            </h1>
            <p className="mt-6 text-lg text-primary-foreground/80 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              დააკავშირეთ რესტორნები სანდო მომწოდებლებთან, აღმოაჩინეთ საუკეთესო კადრები და გაზარდეთ თქვენი ბიზნესი HoReCa ინდუსტრიაში.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <Button size="xl" variant="accent" asChild>
                <Link to="/auth/register">
                  დაიწყეთ უფასოდ
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="hero-outline" asChild>
                <Link to="/suppliers">იხილეთ მომწოდებლები</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border bg-card py-8">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading text-3xl font-bold text-primary lg:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Cards Section */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="font-heading text-3xl font-bold lg:text-4xl">
              როგორ შეგვიძლია დაგეხმაროთ?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              აირჩიეთ თქვენი გზა და გამოიყენეთ ჩვენი B2B სასტუმრო-რესტორნის პლატფორმის სრული პოტენციალი.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {roleCards.map((card, index) => (
              <Card
                key={card.title}
                className="group relative overflow-hidden border-border/50 bg-card hover:border-primary/30 hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-40 overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-6">
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl ${card.color} mb-6 -mt-12 relative z-10 shadow-lg`}>
                    <card.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  
                  <h3 className="font-heading text-xl font-semibold mb-3">{card.title}</h3>
                  <p className="text-muted-foreground mb-6">{card.description}</p>

                  <ul className="space-y-3 mb-8">
                    {card.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full group-hover:shadow-md transition-shadow" asChild>
                    <Link to={card.href}>
                      {card.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="bg-secondary/50 py-16 lg:py-24">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                რატომ HoReCa Hub?
              </span>
              <h2 className="font-heading text-3xl font-bold lg:text-4xl mb-6">
                შექმნილია სპეციალურად სასტუმრო-რესტორნის ინდუსტრიისთვის
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                ზოგადი B2B პლატფორმებისგან განსხვავებით, HoReCa Hub იცნობს რესტორნების, სასტუმროებისა და კეტერინგ ბიზნესების უნიკალურ საჭიროებებს. ჩვენი დადასტურებული მომწოდებლების ქსელი და შერჩეული ვაკანსიების დაფა დაგიზოგავთ დროს და უზრუნველყოფს ხარისხს.
              </p>

              <div className="space-y-4">
                {[
                  "დადასტურებული მომწოდებლები ინდუსტრიული სერთიფიკატებით",
                  "სპეციალიზებული სამუშაო კატეგორიები სასტუმრო-რესტორნისთვის",
                  "პირდაპირი კომუნიკაცია გადაწყვეტილების მიმღებებთან",
                  "გამარტივებული ფასის მოთხოვნისა და შეკვეთის პროცესი",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                      <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={UNSPLASH.featured}
                  alt="Fine dining experience"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="rounded-xl bg-card/90 backdrop-blur-sm p-4 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Star className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">ენდობა 50,000+ ბიზნესი</p>
                        <p className="text-sm text-muted-foreground">სასტუმრო-რესტორნის ინდუსტრიაში</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="rounded-2xl hero-gradient p-8 lg:p-12 text-center">
            <h2 className="font-heading text-3xl font-bold text-primary-foreground lg:text-4xl mb-4">
              მზად ხართ გაზარდოთ თქვენი სასტუმრო-რესტორნის ბიზნესი?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              შემოუერთდით ათასობით რესტორანს, მომწოდებელსა და პროფესიონალს, რომლებიც უკვე იყენებენ HoReCa Hub-ს დასაკავშირებლად და გასაზრდელად.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="accent" asChild>
                <Link to="/auth/register">
                  შექმენით უფასო ანგარიში
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="hero-outline" asChild>
                <Link to="/jobs">იხილეთ ვაკანსიები</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
