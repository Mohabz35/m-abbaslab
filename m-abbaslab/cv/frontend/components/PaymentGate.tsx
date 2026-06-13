import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PaymentGateProps {
  cvId: number;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export default function PaymentGate({ cvId, isOpen, onClose, onPaymentSuccess }: PaymentGateProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"init" | "processing" | "success" | "error">("init");
  const [errorMessage, setErrorMessage] = useState("");

  const initializeMutation = trpc.payment.initializeCheckout.useMutation();
  const verifyMutation = trpc.payment.verifyPayment.useMutation();
  const pricingQuery = trpc.payment.getPricing.useQuery();

  const handleInitiatePayment = async () => {
    setIsProcessing(true);
    setPaymentStep("processing");

    try {
      const result = await initializeMutation.mutateAsync({ cvId });

      if (result.isFree) {
        // First CV is free
        setPaymentStep("success");
        toast.success("Your first CV is free! Proceeding to download...");
        setTimeout(() => {
          onPaymentSuccess();
          onClose();
        }, 2000);
        return;
      }

      // Redirect to Paystack checkout
      if (result.checkoutUrl) {
        // Open Paystack checkout in a new tab
        const checkoutWindow = window.open(result.checkoutUrl, "_blank");

        // Poll for payment verification
        const pollInterval = setInterval(async () => {
          try {
            const verification = await verifyMutation.mutateAsync({
              reference: result.reference,
              cvId,
            });

            if (verification.success) {
              clearInterval(pollInterval);
              setPaymentStep("success");
              toast.success("Payment successful! Your CV is ready to download.");
              setTimeout(() => {
                onPaymentSuccess();
                onClose();
              }, 2000);
            }
          } catch (error) {
            // Still waiting for payment
          }
        }, 3000);

        // Stop polling after 10 minutes
        setTimeout(() => clearInterval(pollInterval), 600000);
      }
    } catch (error) {
      setPaymentStep("error");
      setErrorMessage(error instanceof Error ? error.message : "Payment initialization failed");
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const pricing = pricingQuery.data;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Purchase</DialogTitle>
          <DialogDescription>
            {paymentStep === "success"
              ? "Payment successful!"
              : "Proceed with payment to download your CV"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {paymentStep === "init" && (
            <>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {pricing?.subsequentCVPrice.toFixed(2)} KES
                    </div>
                    <p className="text-slate-600">One-time payment for this CV</p>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">What you get:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Download CV as PDF</li>
                  <li>✓ Email CV to yourself</li>
                  <li>✓ ATS-optimized format</li>
                  <li>✓ AI-humanized content</li>
                </ul>
              </div>

              <Button
                onClick={handleInitiatePayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 gap-2"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Initializing Payment...
                  </>
                ) : (
                  "Pay with Paystack"
                )}
              </Button>

              <p className="text-xs text-slate-500 text-center">
                Secure payment powered by Paystack. Your first CV is free!
              </p>
            </>
          )}

          {paymentStep === "processing" && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-slate-600">Processing your payment...</p>
              <p className="text-sm text-slate-500 mt-2">
                You will be redirected to Paystack to complete the payment.
              </p>
            </div>
          )}

          {paymentStep === "success" && (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Payment Successful!</h3>
              <p className="text-slate-600 mb-4">Your CV is ready to download.</p>
            </div>
          )}

          {paymentStep === "error" && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Payment Failed</h3>
              <p className="text-slate-600 mb-4">{errorMessage}</p>
              <Button
                onClick={() => {
                  setPaymentStep("init");
                  setErrorMessage("");
                }}
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
