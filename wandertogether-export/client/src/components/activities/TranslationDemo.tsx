import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Languages, Sparkles, Globe, Info, Clock, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SUPPORTED_LANGUAGES = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
];

const DEMO_ACTIVITY = {
  id: 'demo-activity',
  title: 'Chichen Itza Archaeological Site',
  description: 'Explore the ancient Mayan ruins of Chichen Itza, a UNESCO World Heritage site and one of the New Seven Wonders of the World.',
  location: 'Chichen Itza, Yucatan, Mexico',
  category: 'attraction',
  estimated_cost: 30,
  estimated_duration: 240
};

// Predefined translations for demonstration
const DEMO_TRANSLATIONS = {
  es: {
    title: 'Sitio Arqueológico de Chichén Itzá',
    description: 'Explora las antiguas ruinas mayas de Chichén Itzá, Patrimonio de la Humanidad por la UNESCO y una de las Nuevas Siete Maravillas del Mundo.',
    location: 'Chichén Itzá, Yucatán, México',
    cultural_tips: 'Visita temprano por la mañana para evitar multitudes y el calor. Lleva protector solar y agua. Los vendedores locales ofrecen artesanías auténticas.',
    local_customs: 'Los guías locales mayas ofrecen perspectivas culturales únicas. Es respetuoso escuchar sobre la historia y significado sagrado del sitio.',
    practical_info: 'El sitio abre a las 8:00 AM. La entrada cuesta aproximadamente $30 USD. Se recomienda contratar un guía oficial. Hay servicios básicos disponibles.'
  },
  fr: {
    title: 'Site Archéologique de Chichen Itza',
    description: 'Explorez les anciennes ruines mayas de Chichen Itza, site du patrimoine mondial de l\'UNESCO et l\'une des nouvelles sept merveilles du monde.',
    location: 'Chichen Itza, Yucatan, Mexique',
    cultural_tips: 'Visitez tôt le matin pour éviter les foules et la chaleur. Apportez de la crème solaire et de l\'eau. Les vendeurs locaux proposent des artisanats authentiques.',
    local_customs: 'Les guides locaux mayas offrent des perspectives culturelles uniques. Il est respectueux d\'écouter l\'histoire et la signification sacrée du site.',
    practical_info: 'Le site ouvre à 8h00. L\'entrée coûte environ 30 USD. Il est recommandé d\'engager un guide officiel. Des services de base sont disponibles.'
  },
  de: {
    title: 'Archäologische Stätte Chichen Itza',
    description: 'Erkunden Sie die alten Maya-Ruinen von Chichen Itza, eine UNESCO-Welterbestätte und eines der neuen sieben Weltwunder.',
    location: 'Chichen Itza, Yucatan, Mexiko',
    cultural_tips: 'Besuchen Sie früh am Morgen, um Menschenmassen und Hitze zu vermeiden. Bringen Sie Sonnencreme und Wasser mit. Lokale Verkäufer bieten authentisches Kunsthandwerk.',
    local_customs: 'Lokale Maya-Führer bieten einzigartige kulturelle Perspektiven. Es ist respektvoll, über die Geschichte und heilige Bedeutung der Stätte zu hören.',
    practical_info: 'Die Stätte öffnet um 8:00 Uhr. Der Eintritt kostet etwa 30 USD. Es wird empfohlen, einen offiziellen Führer zu engagieren. Grundlegende Dienstleistungen sind verfügbar.'
  }
};

export function TranslationDemo() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [includeContext, setIncludeContext] = useState(true);
  const [currentTranslation, setCurrentTranslation] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleTranslate = () => {
    if (!selectedLanguage) return;

    const translation = DEMO_TRANSLATIONS[selectedLanguage as keyof typeof DEMO_TRANSLATIONS];
    
    if (translation) {
      setCurrentTranslation(translation);
      toast({
        title: "Translation complete",
        description: `Activity translated to ${SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name}`,
      });
    } else {
      toast({
        title: "Translation not available",
        description: "This demo only supports Spanish, French, and German translations.",
        variant: "destructive"
      });
    }
  };

  const getLanguageName = (code: string) => {
    return SUPPORTED_LANGUAGES.find(l => l.code === code)?.name || code;
  };

  const getLanguageFlag = (code: string) => {
    return SUPPORTED_LANGUAGES.find(l => l.code === code)?.flag || '🌐';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <Languages size={16} />
          Demo Translation Feature
          <Badge variant="secondary" className="ml-1">
            NEW
          </Badge>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe size={20} />
            AI Activity Translation Demo
          </DialogTitle>
          <DialogDescription>
            Experience the translation feature with a sample activity
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Activity */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Sample Activity</h3>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{DEMO_ACTIVITY.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {DEMO_ACTIVITY.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {DEMO_ACTIVITY.estimated_duration} min
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{DEMO_ACTIVITY.description}</p>
                  <div className="mt-3">
                    <Badge variant="outline">${DEMO_ACTIVITY.estimated_cost}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Translation Controls */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="language-select">Target Language</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger id="language-select">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="include-context"
                  checked={includeContext}
                  onCheckedChange={setIncludeContext}
                />
                <Label htmlFor="include-context" className="text-sm">
                  Include cultural context and travel tips
                </Label>
              </div>

              <Button
                onClick={handleTranslate}
                disabled={!selectedLanguage}
                className="w-full flex items-center gap-2"
              >
                <Sparkles size={16} />
                Translate Activity
              </Button>
              
              <div className="text-xs text-muted-foreground text-center">
                Demo supports Spanish, French, and German
              </div>
            </div>
          </div>

          {/* Translation Result */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Translation Result</h3>
            
            {currentTranslation ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span>{getLanguageFlag(selectedLanguage)}</span>
                    {currentTranslation.title}
                  </CardTitle>
                  <CardDescription>
                    {currentTranslation.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm">{currentTranslation.description}</p>
                  </div>

                  {includeContext && currentTranslation.cultural_tips && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-1">
                          <Info size={14} />
                          Cultural Tips
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {currentTranslation.cultural_tips}
                        </p>
                      </div>
                    </>
                  )}

                  {includeContext && currentTranslation.local_customs && (
                    <div>
                      <h4 className="font-medium mb-2">Local Customs</h4>
                      <p className="text-sm text-muted-foreground">
                        {currentTranslation.local_customs}
                      </p>
                    </div>
                  )}

                  {includeContext && currentTranslation.practical_info && (
                    <div>
                      <h4 className="font-medium mb-2">Practical Information</h4>
                      <p className="text-sm text-muted-foreground">
                        {currentTranslation.practical_info}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex items-center justify-center p-8">
                  <div className="text-center text-muted-foreground">
                    <Languages size={32} className="mx-auto mb-2 opacity-50" />
                    <p>Select a language and click translate to see results</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="border-t pt-4 mt-6">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">How it works:</p>
            <p>1. Select a target language from 10 supported languages</p>
            <p>2. Toggle cultural context for enhanced translations</p>
            <p>3. Get authentic translations with local insights</p>
            <p>4. View translation history and previous translations</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}