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

interface ActivityTranslatorProps {
  activity: {
    id: string;
    title: string;
    description: string;
    location: string;
    category: string;
    estimated_cost?: number;
    estimated_duration?: number;
    translations?: Record<string, any>;
  };
  onTranslationUpdate?: () => void;
}

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

export function ActivityTranslator({ activity, onTranslationUpdate }: ActivityTranslatorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [includeContext, setIncludeContext] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentTranslation, setCurrentTranslation] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const hasTranslations = activity.translations && Object.keys(activity.translations).length > 0;

  const handleTranslate = async () => {
    if (!selectedLanguage) return;

    setIsTranslating(true);
    try {
      const response = await fetch('/api/translate-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activityId: activity.id,
          targetLanguage: selectedLanguage,
          includeContext: includeContext
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || 'Translation service unavailable');
      }

      const data = await response.json();
      if (data.success && data.translation) {
        setCurrentTranslation(data.translation);
      } else {
        throw new Error('Invalid translation response');
      }
      
      toast({
        title: "Translation complete",
        description: `Activity translated to ${SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name}`,
      });

      onTranslationUpdate?.();

    } catch (error: any) {
      console.error('Translation error:', error);
      
      // Show fallback translation in case of API failure
      const fallbackTranslation = {
        title: activity.title,
        description: activity.description,
        location: activity.location,
        cultural_tips: "Translation service is currently experiencing issues. Please try again later or contact support.",
        local_customs: "Cultural information will be available when the translation service is restored.",
        practical_info: "Practical travel tips will be provided when the service is working properly."
      };
      
      setCurrentTranslation(fallbackTranslation);
      
      toast({
        title: "Translation service unavailable",
        description: "Showing fallback content. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
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
          size="sm" 
          className="flex items-center gap-2"
        >
          <Languages size={14} />
          Translate
          {hasTranslations && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {Object.keys(activity.translations || {}).length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe size={20} />
            AI Activity Translation
          </DialogTitle>
          <DialogDescription>
            Translate "{activity.title}" with cultural context and travel tips
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Activity */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Original Activity</h3>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{activity.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {activity.location}
                    </span>
                    {activity.estimated_duration && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {activity.estimated_duration} min
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{activity.description}</p>
                  {activity.estimated_cost && (
                    <div className="mt-3">
                      <Badge variant="outline">${activity.estimated_cost}</Badge>
                    </div>
                  )}
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
                disabled={!selectedLanguage || isTranslating}
                className="w-full flex items-center gap-2"
              >
                <Sparkles size={16} />
                {isTranslating ? 'Translating...' : 'Translate Activity'}
              </Button>
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

            {/* Existing Translations */}
            {hasTranslations && (
              <div>
                <h4 className="font-medium mb-3">Existing Translations</h4>
                <div className="space-y-2">
                  {Object.entries(activity.translations || {}).map(([langCode, translation]: [string, any]) => (
                    <Button
                      key={langCode}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        setSelectedLanguage(langCode);
                        setCurrentTranslation(translation);
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <span>{getLanguageFlag(langCode)}</span>
                        <span>{getLanguageName(langCode)}</span>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {new Date(translation.translated_at).toLocaleDateString()}
                        </Badge>
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}