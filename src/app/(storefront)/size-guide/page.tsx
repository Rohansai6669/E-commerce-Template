import * as React from 'react';
import { Container } from '@/components/layout/container';
import { Heading, Text } from '@/components/ui/typography';
import { Card, CardContent } from '@/components/ui/card';
import { Ruler, Sparkles, CheckCircle2 } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Size Guide & Measurement Chart | Lexido',
  description: 'Find your perfect fit with our comprehensive sizing tables for tops, trousers, and outerwear.',
};

export default function SizeGuidePage() {
  return (
    <Container className="py-12 sm:py-16 max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-primary font-mono block">
          TAILORING &amp; FIT
        </span>
        <Heading level={1} className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading text-foreground">
          Sizing Guide
        </Heading>
        <Text className="text-sm text-muted-foreground max-w-xl mx-auto">
          All our garments are cut with modern minimalist silhouettes. Reference the measurements below in inches and centimeters to determine your ideal size.
        </Text>
      </div>

      {/* Sizing Tables */}
      <div className="space-y-10">
        {/* Tops, Hoodies & Shirts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider font-heading text-foreground">
              Tops, T-Shirts &amp; Knitwear
            </h2>
            <span className="text-xs font-mono text-muted-foreground">Measurements in Inches (cm)</span>
          </div>

          <div className="overflow-x-auto border border-border">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-muted/40 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3 sm:p-4">Size</th>
                  <th className="p-3 sm:p-4">Chest</th>
                  <th className="p-3 sm:p-4">Shoulder</th>
                  <th className="p-3 sm:p-4">Length</th>
                  <th className="p-3 sm:p-4">Sleeve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                <tr className="hover:bg-muted/10">
                  <td className="p-3 sm:p-4 font-bold text-foreground">XS</td>
                  <td className="p-3 sm:p-4">36 in (91 cm)</td>
                  <td className="p-3 sm:p-4">16.5 in (42 cm)</td>
                  <td className="p-3 sm:p-4">26 in (66 cm)</td>
                  <td className="p-3 sm:p-4">24 in (61 cm)</td>
                </tr>
                <tr className="hover:bg-muted/10">
                  <td className="p-3 sm:p-4 font-bold text-foreground">S</td>
                  <td className="p-3 sm:p-4">38 in (96 cm)</td>
                  <td className="p-3 sm:p-4">17.2 in (44 cm)</td>
                  <td className="p-3 sm:p-4">27 in (68 cm)</td>
                  <td className="p-3 sm:p-4">24.5 in (62 cm)</td>
                </tr>
                <tr className="hover:bg-muted/10">
                  <td className="p-3 sm:p-4 font-bold text-foreground">M</td>
                  <td className="p-3 sm:p-4">40 in (101 cm)</td>
                  <td className="p-3 sm:p-4">18 in (46 cm)</td>
                  <td className="p-3 sm:p-4">28 in (71 cm)</td>
                  <td className="p-3 sm:p-4">25 in (63 cm)</td>
                </tr>
                <tr className="hover:bg-muted/10">
                  <td className="p-3 sm:p-4 font-bold text-foreground">L</td>
                  <td className="p-3 sm:p-4">42 in (107 cm)</td>
                  <td className="p-3 sm:p-4">18.7 in (47 cm)</td>
                  <td className="p-3 sm:p-4">29 in (74 cm)</td>
                  <td className="p-3 sm:p-4">25.5 in (65 cm)</td>
                </tr>
                <tr className="hover:bg-muted/10">
                  <td className="p-3 sm:p-4 font-bold text-foreground">XL</td>
                  <td className="p-3 sm:p-4">44 in (112 cm)</td>
                  <td className="p-3 sm:p-4">19.5 in (49 cm)</td>
                  <td className="p-3 sm:p-4">30 in (76 cm)</td>
                  <td className="p-3 sm:p-4">26 in (66 cm)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottoms, Denim & Trousers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider font-heading text-foreground">
              Bottoms, Denim &amp; Trousers
            </h2>
            <span className="text-xs font-mono text-muted-foreground">True-to-size waist fitting</span>
          </div>

          <div className="overflow-x-auto border border-border">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-muted/40 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3 sm:p-4">Waist Size</th>
                  <th className="p-3 sm:p-4">Hip</th>
                  <th className="p-3 sm:p-4">Inseam</th>
                  <th className="p-3 sm:p-4">Leg Opening</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                <tr className="hover:bg-muted/10">
                  <td className="p-3 sm:p-4 font-bold text-foreground">28 / XS</td>
                  <td className="p-3 sm:p-4">36 in (91 cm)</td>
                  <td className="p-3 sm:p-4">31 in (79 cm)</td>
                  <td className="p-3 sm:p-4">13 in (33 cm)</td>
                </tr>
                <tr className="hover:bg-muted/10">
                  <td className="p-3 sm:p-4 font-bold text-foreground">30 / S</td>
                  <td className="p-3 sm:p-4">38 in (96 cm)</td>
                  <td className="p-3 sm:p-4">32 in (81 cm)</td>
                  <td className="p-3 sm:p-4">13.5 in (34 cm)</td>
                </tr>
                <tr className="hover:bg-muted/10">
                  <td className="p-3 sm:p-4 font-bold text-foreground">32 / M</td>
                  <td className="p-3 sm:p-4">40 in (101 cm)</td>
                  <td className="p-3 sm:p-4">32 in (81 cm)</td>
                  <td className="p-3 sm:p-4">14 in (35 cm)</td>
                </tr>
                <tr className="hover:bg-muted/10">
                  <td className="p-3 sm:p-4 font-bold text-foreground">34 / L</td>
                  <td className="p-3 sm:p-4">42 in (107 cm)</td>
                  <td className="p-3 sm:p-4">33 in (84 cm)</td>
                  <td className="p-3 sm:p-4">14.5 in (37 cm)</td>
                </tr>
                <tr className="hover:bg-muted/10">
                  <td className="p-3 sm:p-4 font-bold text-foreground">36 / XL</td>
                  <td className="p-3 sm:p-4">44 in (112 cm)</td>
                  <td className="p-3 sm:p-4">33 in (84 cm)</td>
                  <td className="p-3 sm:p-4">15 in (38 cm)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* How to Measure Card */}
      <Card className="border-border bg-muted/10">
        <CardContent className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-heading text-foreground">
              How to Take Your Measurements
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-muted-foreground">
            <div>
              <span className="font-bold text-foreground block mb-1">1. Chest:</span>
              <p className="leading-relaxed">
                Measure around the fullest part of your chest, keeping the tape horizontal under your arms and across your shoulder blades.
              </p>
            </div>
            <div>
              <span className="font-bold text-foreground block mb-1">2. Natural Waist:</span>
              <p className="leading-relaxed">
                Measure around your natural waistline, which is the narrowest area between your rib cage and hips.
              </p>
            </div>
            <div>
              <span className="font-bold text-foreground block mb-1">3. Inseam:</span>
              <p className="leading-relaxed">
                Measure from the highest point of the inner thigh straight down the inside leg to the bottom of the ankle.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}

