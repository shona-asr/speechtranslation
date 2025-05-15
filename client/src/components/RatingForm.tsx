
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RatingFormProps {
  featureType?: string;
  featureTitle?: string;
  userId?: number | null;
}

export const RatingForm = ({ featureType, featureTitle, userId }: RatingFormProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedFeature, setSelectedFeature] = useState(featureType || 'general');
  const { toast } = useToast();

  const features = [
    { value: 'transcription', label: 'Speech Transcription' },
    { value: 'translation', label: 'Text Translation' },
    { value: 'textToSpeech', label: 'Text to Speech' },
    { value: 'speechToSpeech', label: 'Speech to Speech' },
    { value: 'general', label: 'Overall Experience' }
  ];

  const handleSubmit = async () => {
    console.log('RatingForm: Starting submission with:', { rating, comment, selectedFeature });
    
    if (rating === 0) {
      console.log('RatingForm: Submission blocked - no rating selected');
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('RatingForm: Sending request to backend');
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          featureType: selectedFeature,
          rating,
          comment: comment.trim() || null,
        }),
      });

      if (!response.ok) {
        console.log('RatingForm: Backend request failed:', response.status);
        throw new Error('Failed to submit rating');
      }

      console.log('RatingForm: Rating submitted successfully');
      toast({
        title: "Thank You!",
        description: "Your rating has been submitted successfully",
      });

      // Reset form
      setRating(0);
      setComment('');
      setSelectedFeature(featureType || 'general');
      console.log('RatingForm: Form reset completed');
    } catch (error) {
      console.error('RatingForm: Error during submission:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h4 className="font-medium mb-2">{featureTitle || 'Rate Your Experience'}</h4>
        <div className="mb-4">
          <Select
            value={selectedFeature}
            onValueChange={setSelectedFeature}
          >
            <SelectTrigger className="w-full mb-4">
              <SelectValue placeholder="Select a feature to rate" />
            </SelectTrigger>
            <SelectContent>
              {features.map((feature) => (
                <SelectItem key={feature.value} value={feature.value}>
                  {feature.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mb-4">
          <StarRating value={rating} onChange={setRating} />
        </div>
        <Textarea
          placeholder="Share your experience (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mb-4"
        />
        <Button onClick={handleSubmit}>Submit Rating</Button>
      </CardContent>
    </Card>
  );
};
