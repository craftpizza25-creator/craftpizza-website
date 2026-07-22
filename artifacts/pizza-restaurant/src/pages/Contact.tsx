import * as React from "react"
import { useSubmitContact } from "@workspace/api-client-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react"

export default function Contact() {
  const submitContact = useSubmitContact()
  const [success, setSuccess] = React.useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    submitContact.mutate({
      data: {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string || undefined,
        message: formData.get("message") as string
      }
    }, {
      onSuccess: () => {
        setSuccess(true)
        e.currentTarget.reset()
      }
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-secondary py-20 text-secondary-foreground text-center">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
            Skontaktuj się z nami
          </h1>
          <p className="font-sans text-lg text-secondary-foreground/70 max-w-2xl mx-auto">
            Chcesz zarezerwować stolik, zapytać o catering lub po prostu porozmawiać? Chętnie odpowiemy.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-12">
            <div>
              <h2 className="font-serif text-3xl font-semibold text-foreground mb-8">Odwiedź nas</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-lg mb-1">Adres</h3>
                    <p className="text-muted-foreground">ul. Flisaków 16, Łączany</p>
                    <p className="text-muted-foreground">trasa velo Skawina</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Clock className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-lg mb-1">Godziny otwarcia</h3>
                    <p className="text-muted-foreground">Piątek: 18:00 – 22:00</p>
                    <p className="text-muted-foreground">Sobota – Niedziela: 10:00 – 21:00</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Phone className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-lg mb-1">Telefon</h3>
                    <p className="text-muted-foreground">+48 888 118 175</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Mail className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-lg mb-1">E-mail</h3>
                    <p className="text-muted-foreground">craftpizza25@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps embed */}
            <div className="w-full h-64 rounded-xl border border-border overflow-hidden">
              <iframe
                title="Craft Pizza – mapa"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src="https://maps.google.com/maps?q=XHJM%2BPH+%C5%81%C4%85czany&output=embed"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card border border-border rounded-xl p-8 lg:p-10 shadow-sm h-fit">
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-8">Wyślij wiadomość</h2>

            {success ? (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center space-y-4 animate-in fade-in">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
                  <Send className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-medium text-foreground">Wiadomość wysłana</h3>
                <p className="text-muted-foreground">
                  Dziękujemy! Otrzymaliśmy Twoją wiadomość i odpiszemy tak szybko, jak to możliwe.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSuccess(false)}
                  className="mt-4"
                >
                  Wyślij kolejną
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">Imię i nazwisko *</label>
                  <Input id="name" name="name" required placeholder="Twoje imię i nazwisko" className="bg-background" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">E-mail *</label>
                  <Input id="email" name="email" type="email" required placeholder="Twój adres e-mail" className="bg-background" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-foreground">Telefon (opcjonalnie)</label>
                  <Input id="phone" name="phone" type="tel" placeholder="Twój numer telefonu" className="bg-background" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-foreground">Wiadomość *</label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    placeholder="W czym możemy pomóc?"
                    className="bg-background min-h-[150px] resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-semibold"
                  disabled={submitContact.isPending}
                >
                  {submitContact.isPending ? "Wysyłanie..." : "Wyślij wiadomość"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
