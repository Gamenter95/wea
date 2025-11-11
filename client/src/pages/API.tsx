
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Key, Copy, RefreshCw, ToggleLeft, ToggleRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function API() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });

  const { data: apiSettings } = useQuery<any>({
    queryKey: ["/api/settings/api"],
  });

  const toggleApiMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const res = await apiRequest("POST", "/api/settings/toggle-api", { enabled });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/api"] });
      toast({ title: "Success", description: "API settings updated" });
    },
  });

  const generateTokenMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/settings/generate-token");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/api"] });
      toast({ title: "Success", description: "New API token generated" });
    },
  });

  const revokeTokenMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/settings/revoke-token");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/api"] });
      toast({ title: "Success", description: "API token revoked" });
    },
  });

  const domain = window.location.origin;
  const apiEndpoint = apiSettings?.token
    ? `${domain}/api/payment?type=wallet&token=${apiSettings.token}&wwid={recipient_wwid}&amount={amount}`
    : "";

  const copyEndpoint = () => {
    navigator.clipboard.writeText(apiEndpoint);
    toast({ title: "Copied!", description: "API endpoint copied to clipboard" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="h-16 border-b bg-card/80 backdrop-blur-lg flex items-center px-4 sticky top-0 z-50 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          API Settings
        </h1>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Payments
            </CardTitle>
            <CardDescription>
              Enable API payments to accept payments programmatically
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="api-enabled" className="text-base">
                  Enable API Payments
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow payments through API endpoint
                </p>
              </div>
              <Switch
                id="api-enabled"
                checked={apiSettings?.enabled || false}
                onCheckedChange={(checked) => toggleApiMutation.mutate(checked)}
                disabled={toggleApiMutation.isPending}
              />
            </div>

            {apiSettings?.enabled && (
              <>
                <div className="space-y-3">
                  <Label>API Token</Label>
                  <div className="flex gap-2">
                    <Input
                      value={apiSettings?.token || "No token generated"}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => generateTokenMutation.mutate()}
                      disabled={generateTokenMutation.isPending}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  {apiSettings?.token && (
                    <Button
                      variant="destructive"
                      onClick={() => revokeTokenMutation.mutate()}
                      disabled={revokeTokenMutation.isPending}
                      className="w-full"
                    >
                      Revoke Token
                    </Button>
                  )}
                </div>

                {apiSettings?.token && (
                  <div className="space-y-3">
                    <Label>API Endpoint</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={apiEndpoint}
                          readOnly
                          className="font-mono text-xs"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={copyEndpoint}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Replace {"{recipient_wwid}"} and {"{amount}"} with actual values
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {apiSettings?.enabled && (
          <Card>
            <CardHeader>
              <CardTitle>Usage Example</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`curl -X POST "${domain}/api/payment?type=wallet&token=${apiSettings?.token || 'YOUR_TOKEN'}&wwid=recipient@ww&amount=100"`}
              </pre>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
