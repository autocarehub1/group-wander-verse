import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

const JoinTrip = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<any>(null);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setError("Invalid invitation link");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/invitations/${token}`);
        if (!response.ok) {
          setError(
            response.status === 404
              ? "Invitation not found or expired"
              : "Failed to load invitation",
          );
          return;
        }

        const invitationData = await response.json();
        setInvitation(invitationData);

        const tripResponse = await fetch(
          `/api/trips/${invitationData.trip_id}`,
        );
        if (tripResponse.ok) {
          setTrip(await tripResponse.json());
        } else {
          console.warn("Trip details could not be fetched");
        }
      } catch (err) {
        setError("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleJoinTrip = async () => {
    if (!userName.trim() || !userEmail.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter your name and email to join the trip.",
        variant: "destructive",
      });
      return;
    }

    setJoining(true);
    try {
      const email = userEmail.trim();
      const full_name = userName.trim();
      let user = null;

      const createRes = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, full_name }),
      });

      if (createRes.ok) {
        user = await createRes.json();
      } else if (createRes.status === 409) {
        // Conflict: User exists
        const getUserRes = await fetch(
          `/api/users/by-email/${encodeURIComponent(email)}`,
        );
        if (getUserRes.ok) {
          user = await getUserRes.json();
        } else {
          throw new Error("User exists but could not be fetched.");
        }
      } else {
        const errData = await createRes.json().catch(() => ({}));
        throw new Error(errData?.error || "Failed to create user.");
      }

      if (!user || !user.id) {
        throw new Error("User creation failed. No user ID found.");
      }

      const acceptRes = await fetch(`/api/invitations/${token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });

      if (!acceptRes.ok) {
        const err = await acceptRes.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to accept invitation");
      }

      toast({
        title: "You're in!",
        description: "Successfully joined the trip. Redirecting...",
      });

      setTimeout(() => navigate(`/trips/${invitation.trip_id}`), 2000);
    } catch (err: any) {
      toast({
        title: "Join Failed",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-muted-foreground">Loading invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Invitation Error</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate("/")} variant="outline">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-primary/10 rounded-full mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">You're Invited!</CardTitle>
          <CardDescription>
            Join an exciting group trip adventure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {trip && (
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg space-y-4">
              <h2 className="text-xl font-semibold">{trip.title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">Destination:</span>
                  <span>{trip.destination}</span>
                </div>
                {trip.start_date && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-medium">Start:</span>
                    <span>
                      {new Date(trip.start_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              {trip.description && (
                <p className="text-sm text-muted-foreground">
                  {trip.description}
                </p>
              )}
              {invitation?.message && (
                <div className="bg-white/50 p-3 rounded border-l-4 border-primary">
                  <p className="text-sm italic">"{invitation.message}"</p>
                </div>
              )}
            </div>
          )}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Join the Adventure</h3>
              <p className="text-sm text-muted-foreground">
                Enter your details to join this amazing trip
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  disabled={joining}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  disabled={joining}
                />
              </div>
            </div>
            <Button
              onClick={handleJoinTrip}
              className="w-full"
              size="lg"
              disabled={joining}
            >
              {joining ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Joining Trip...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Join Trip
                </>
              )}
            </Button>
          </div>
          <div className="text-center text-xs text-muted-foreground">
            {invitation?.expires_at && (
              <p>
                This invitation expires on{" "}
                {new Date(invitation.expires_at).toLocaleDateString()}
              </p>
            )}
            <p className="mt-1">Powered by WanderTogether</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinTrip;
