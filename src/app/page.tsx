import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Calendar, Users, Mail, Share2, ArrowRight, Check } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              <span className="font-semibold text-lg">Event RSVP</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/login">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Simple Event RSVPs
              <br />
              <span className="text-muted-foreground">Made Easy</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Create events, share links, and collect RSVPs. No signups required
              for your guests. Track who&apos;s coming with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="text-lg px-8">
                  Create Your First Event
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Everything you need
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <Calendar className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Create Events</CardTitle>
                  <CardDescription>
                    Set up your event with all the details: title, date, time,
                    location, and optional image.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Share2 className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Share Links</CardTitle>
                  <CardDescription>
                    Get a shareable link for your event. Send it via email,
                    text, or social media.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Collect RSVPs</CardTitle>
                  <CardDescription>
                    Guests can RSVP with just their name. No account required.
                    Track Going, Maybe, and more.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Mail className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Send Updates</CardTitle>
                  <CardDescription>
                    Notify your guests about event updates. Reach everyone who
                    provided their email.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                How it works
              </h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Sign up as an organizer
                    </h3>
                    <p className="text-muted-foreground">
                      Create your free account with just your email. We&apos;ll
                      send you a magic link - no password needed.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Create your event
                    </h3>
                    <p className="text-muted-foreground">
                      Add your event details, upload an image, and set the
                      capacity if needed. Get a unique link to share.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Share with guests
                    </h3>
                    <p className="text-muted-foreground">
                      Send the link to your guests. They can RSVP instantly
                      without creating an account.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Track responses
                    </h3>
                    <p className="text-muted-foreground">
                      See who&apos;s coming in real-time. Send updates to guests
                      who provided their email.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">
                RSVP Options
              </h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">Going</div>
                        <div className="text-sm text-muted-foreground">
                          Count toward event capacity
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Check className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-medium">Maybe</div>
                        <div className="text-sm text-muted-foreground">
                          Keep on the list for updates
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Check className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">Interested in Future</div>
                        <div className="text-sm text-muted-foreground">
                          Can&apos;t make it but want to stay informed
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <Check className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium">Not Going</div>
                        <div className="text-sm text-muted-foreground">
                          Thanks for letting us know
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Create your first event in minutes. No credit card required.
            </p>
            <Link href="/login">
              <Button size="lg" className="text-lg px-8">
                Create Your Event
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span className="font-semibold">Event RSVP</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Simple event RSVP management for everyone.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
