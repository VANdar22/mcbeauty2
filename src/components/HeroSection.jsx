import React, { useEffect, useState } from 'react'

const items = [
  {
    image:
      'https://res.cloudinary.com/zomqdsfa/image/upload/c_fill,w_2400,h_900,g_auto/v1791390964/cosmos_600420928.webp',
    caption: 'One',
  },
  {
    image:
      'https://res.cloudinary.com/zomqdsfa/image/upload/c_fill,w_2400,h_900,g_auto/v1791390963/cosmos_621383783.webp',
    caption: 'Two',
  },
  {
    image:
    'https://res.cloudinary.com/zomqdsfa/image/upload/c_fill,w_2400,h_900,g_auto/v1791390963/cosmos_1425538893.webp',
    caption: 'Three',
  },
]

const HeroSection = () => {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % items.length)
  }

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + items.length) % items.length)
  }

  return (
    <section className="relative w-full overflow-hidden aspect-[8/3]">
      {items.map((item, index) => (
        <div
          key={item.image}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={item.image}
            alt={item.caption}
            className="h-full w-full object-cover"
          />
        </div>
      ))}

      {/* Previous */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2
                   flex h-9 w-9 items-center justify-center
                   rounded-full bg-white/70 text-gray-700
                   backdrop-blur-sm transition hover:bg-white"
      >
        ‹
      </button>

      {/* Next */}
      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2
                   flex h-9 w-9 items-center justify-center
                   rounded-full bg-white/70 text-gray-700
                   backdrop-blur-sm transition hover:bg-white"
      >
        ›
      </button>

      {/* Indicators */}
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              index === current
                ? 'w-7 bg-white'
                : 'w-1.5 bg-white/60'
            }`}
          />
        ))}
      </div>
    </section>
  )
}

export default HeroSection