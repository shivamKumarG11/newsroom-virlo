'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface ImageItem {
  url: string
  alt: string
  caption?: string
}

interface ImageGridProps {
  images: ImageItem[]
  title?: string
  columns?: number
}

export function ImageGrid({ images, title, columns = 3 }: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  return (
    <>
      {/* Grid */}
      <div
        className={`grid gap-4 mb-8 grid-cols-1 ${
          columns === 2
            ? 'md:grid-cols-2'
            : columns === 3
            ? 'md:grid-cols-3'
            : 'md:grid-cols-4'
        }`}
      >
        {images.map((image, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="group cursor-pointer overflow-hidden rounded-lg bg-secondary"
            onClick={() => setSelectedImage(idx)}
          >
            <div className="relative aspect-square overflow-hidden">
              <img
                src={image.url}
                alt={image.alt}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/20" />
            </div>
            {image.caption && (
              <div className="p-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {image.caption}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg bg-card"
          >
            <img
              src={images[selectedImage].url}
              alt={images[selectedImage].alt}
              className="h-full w-full object-contain"
            />

            {/* Caption */}
            {images[selectedImage].caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <p className="text-white">{images[selectedImage].caption}</p>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
            >
              <X size={24} />
            </button>

            {/* Navigation */}
            <div className="absolute inset-y-0 left-0 flex items-center pl-4">
              <button
                onClick={() =>
                  setSelectedImage((prev) =>
                    prev === 0 ? images.length - 1 : prev! - 1
                  )
                }
                className="rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
              >
                ←
              </button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <button
                onClick={() =>
                  setSelectedImage((prev) =>
                    prev === images.length - 1 ? 0 : prev! + 1
                  )
                }
                className="rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
              >
                →
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}
