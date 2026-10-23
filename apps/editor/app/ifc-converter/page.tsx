import type { Metadata } from 'next'
import { IFCConverterClient } from './ifc-converter-client'

export const metadata: Metadata = {
  title: 'IFC Converter — Aruct',
  description: 'Import and convert IFC files into Aruct scenes. Preserve geometry, metadata, and storey structure.',
}

export default function IFCConverterPage() {
  return <IFCConverterClient />
}
