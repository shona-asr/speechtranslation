import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Headerunloged";
import { RatingForm } from "@/components/RatingForm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { useQuery } from "@tanstack/react-query";

const LandingPage = () => {
  const { user } = useAuth();
  const { data: ratings } = useQuery({
    queryKey: ['/api/ratings'],
    queryFn: async () => {
      const response = await fetch('/api/ratings');
      if (!response.ok) throw new Error('Failed to fetch ratings');
      return response.json();
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Navigation */}
      <Header user={user} />

      {/* Hero Section */}
      <section className="py-20 md:py-32 container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Powerful Speech Recognition
          <br />
          <span className="text-primary">for Every Need</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
          Transcribe, translate, and transform speech with our advanced AI-powered platform.
          From real-time transcription to multilingual speech-to-speech conversion.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href={user ? "/dashboard" : "/login"}>
            <Button size="lg" className="w-full sm:w-auto px-8">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <a href="#features">
            <Button size="lg" variant="outline" className="w-full sm:w-auto px-8">
              Learn More
            </Button>
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              title="Speech Transcription" 
              description="Convert speech to text accurately in multiple languages with real-time processing."
              icon="🎙️"
            />
            <FeatureCard 
              title="Text Translation" 
              description="Translate text between languages while preserving context and meaning."
              icon="🌐"
            />
            <FeatureCard 
              title="Text to Speech" 
              description="Convert written text into natural-sounding speech in various languages."
              icon="🔊"
            />
            <FeatureCard 
              title="Speech to Speech" 
              description="Directly translate spoken words from one language to another."
              icon="🗣️"
            />
          </div>
        </div>
      </section>

      {/* User Reviews */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">User Reviews</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-6">Share Your Experience</h3>
              <RatingForm 
                featureType="general" 
                featureTitle="Application"
                userId={user?.id}
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-6">What Users Say</h3>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4">
                {ratings?.map((rating, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">User #{rating.userId}</span>
                        <Badge variant="outline">{rating.featureType}</Badge>
                      </div>
                      <StarRating value={rating.rating} readonly size="sm" />
                    </div>
                    {rating.comment && (
                      <p className="text-muted-foreground">{rating.comment}</p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to transform how you work with speech?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of users who are already benefiting from our advanced speech technology.
          </p>
          <Link href={user ? "/dashboard" : "/login"}>
            <Button size="lg" variant="secondary" className="px-8">
              Start Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
              <span className="font-semibold">Speech AI</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact Us</a>
            </div>
          </div>
          <div className="mt-8 text-center text-muted-foreground text-sm">
            © {new Date().getFullYear()} Speech AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature card component
const FeatureCard = ({ title, description, icon }: { title: string, description: string, icon: string }) => {
  return (
    <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default LandingPage;