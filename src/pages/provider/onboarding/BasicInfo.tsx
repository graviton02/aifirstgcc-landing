import { Container } from '@/components/shared/Container'
import { FileText } from 'lucide-react'

export default function BasicInfo() {
  return (
    <div className="py-20">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-display-sm text-enterprise-900 mb-4">Basic Information</h1>
          <p className="text-lg text-enterprise-600">
            Tell us about your company. Provide your company name, headquarters location, and company size to get started.
          </p>
        </div>
      </Container>
    </div>
  )
}
