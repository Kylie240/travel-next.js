import { Globe, Mail, Facebook, Instagram, Twitter } from "lucide-react"

interface SocialLinksProps {
  website: string
  email: string
  social: {
    facebook: string
    instagram: string
    twitter: string
  }
}

export function SocialLinks({ website, email, social }: SocialLinksProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="flex flex-wrap gap-6 justify-center md:justify-start">
        <a 
          href={`https://${website}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <Globe className="h-5 w-5" />
          <span>{website}</span>
        </a>
        <a 
          href={`mailto:${email}`} 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <Mail className="h-5 w-5" />
          <span>{email}</span>
        </a>
        <a 
          href={`https://facebook.com/${social.facebook}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <Facebook className="h-5 w-5" />
          <span>Facebook</span>
        </a>
        <a 
          href={`https://instagram.com/${social.instagram}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <Instagram className="h-5 w-5" />
          <span>Instagram</span>
        </a>
        <a 
          href={`https://twitter.com/${social.twitter}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <Twitter className="h-5 w-5" />
          <span>Twitter</span>
        </a>
      </div>
    </div>
  )
} 