import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Mail, Phone, MapPin, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Get in Touch</h1>
            <p className="text-lg text-muted-foreground">
              Have questions or need support? We're here to help you with your e-signature needs.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1">
                <Card className="border-none shadow-md bg-muted/50">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Email Us</h3>
                      <p className="text-sm text-muted-foreground mb-2">Our team is here to help.</p>
                      <a href="mailto:wecare@esignvia.com" className="text-primary font-medium hover:underline">
                        wecare@esignvia.com
                      </a>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-muted/50">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Call Us</h3>
                      <p className="text-sm text-muted-foreground mb-2">Mon-Fri from 9am to 6pm.</p>
                      <a href="tel:+919008367818" className="text-primary font-medium hover:underline">
                        +91 90083 67818
                      </a>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-muted/50">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Visit Us</h3>
                      <p className="text-sm text-muted-foreground mb-2">Come say hello at our office.</p>
                      <p className="text-sm leading-relaxed">
                        MADHYAVARTI SOLUTIONS PRIVATE LIMITED<br />
                        NO:8, K.NO.13-3, 28TH CROSS,<br />
                        HULIMAVU MAIN ROAD, Hulimavu,<br />
                        Bangalore South, Bangalore - 560076,<br />
                        Karnataka
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Map Embed */}
              <div className="rounded-2xl overflow-hidden border shadow-lg h-[300px]">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7778.901402925576!2d77.607355!3d12.878715!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae152a98db83ad%3A0x19fef03a9fe461e7!2s8%20k%2C%2013%2C%2028th%20Cross%20Rd%2C%20Raghavendra%20Layout%2C%20Hanuman%20Nagar%2C%20Hulimavu%2C%20Bengaluru%2C%20Karnataka%20560076!5e0!3m2!1sen!2sin!4v1767703515407!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-background border rounded-2xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
              <form className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <Input placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <Input placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input placeholder="How can we help?" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea placeholder="Tell us more about your inquiry..." className="min-h-[150px]" />
                </div>
                <Button className="w-full rounded-full h-12 text-lg">
                  <Send className="mr-2 h-5 w-5" /> Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
