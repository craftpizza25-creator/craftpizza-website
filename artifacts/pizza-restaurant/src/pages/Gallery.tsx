import { useGetGalleryItems } from "@workspace/api-client-react"
import { cn } from "@/lib/utils"

export default function Gallery() {
  const { data: items, isLoading } = useGetGalleryItems()

  return (
    <div className="bg-secondary text-secondary-foreground min-h-screen pt-12 pb-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-sans tracking-widest uppercase text-xs font-bold text-primary mb-4 block">
            Za kulisami
          </span>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
            Nasz świat
          </h1>
          <p className="font-sans text-lg text-secondary-foreground/70">
            Spojrzenie na codzienną pracę Craft Pizza — składniki, pasja i ludzie, którzy ją tworzą.
          </p>
        </div>

        {isLoading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-full bg-secondary-foreground/10 rounded-sm animate-pulse",
                  i % 3 === 0 ? "aspect-square" : i % 2 === 0 ? "aspect-[4/5]" : "aspect-[3/4]"
                )}
              />
            ))}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {items?.map((item) => (
              <div key={item.id} className="break-inside-avoid relative group overflow-hidden rounded-sm bg-black">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.alt}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full aspect-[4/5] bg-secondary-foreground/10 flex items-center justify-center">
                    <span className="font-serif text-secondary-foreground/30 text-lg">{item.alt}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <span className="text-white font-serif text-lg font-medium tracking-wide">
                    {item.alt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
