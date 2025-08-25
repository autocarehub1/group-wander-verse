import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";
import PaymentVerificationModal from "./PaymentVerificationModal";

interface DebtSummaryProps {
  tripId: string;
}

interface DebtItem {
  split_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar: string;
  expense_id: string;
  expense_title: string;
  expense_category: string;
  amount: string;
  is_paid: boolean;
  payment_status: string;
  payment_method: string;
  payment_proof_url: string;
  created_at: string;
}

export default function DebtSummary({ tripId }: DebtSummaryProps) {
  const [selectedDebt, setSelectedDebt] = useState<DebtItem | null>(null);
  
  const { data: debtSummary = [], isLoading } = useQuery<DebtItem[]>({
    queryKey: [`/api/trips/${tripId}/debt-summary`],
    enabled: !!tripId,
  });

  // Group debts by user
  const debtsByUser = debtSummary.reduce((acc: any, debt: DebtItem) => {
    if (!acc[debt.user_id]) {
      acc[debt.user_id] = {
        user: {
          id: debt.user_id,
          name: debt.user_name,
          email: debt.user_email,
          avatar: debt.user_avatar,
        },
        debts: [],
        totalAmount: 0,
      };
    }
    acc[debt.user_id].debts.push(debt);
    acc[debt.user_id].totalAmount += parseFloat(debt.amount);
    return acc;
  }, {});

  const userDebts = Object.values(debtsByUser);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Outstanding Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (userDebts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            All Payments Complete
          </CardTitle>
          <CardDescription>
            Everyone has paid their share! 🎉
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4" />;
      case 'submitted':
        return <DollarSign className="h-4 w-4" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Outstanding Payments ({userDebts.length} people)
          </CardTitle>
          <CardDescription>
            Track who still owes money and verify payment proofs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userDebts.map((userDebt: any) => (
            <div key={userDebt.user.id} className="border rounded-lg p-4">
              {/* User Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={userDebt.user.avatar} />
                    <AvatarFallback>
                      {userDebt.user.name?.charAt(0) || userDebt.user.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{userDebt.user.name || userDebt.user.email}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{userDebt.user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">${userDebt.totalAmount.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{userDebt.debts.length} expense{userDebt.debts.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Individual Debts */}
              <div className="space-y-2">
                {userDebt.debts.map((debt: DebtItem) => (
                  <div key={debt.split_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <div className="flex-1">
                      <p className="font-medium">{debt.expense_title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {debt.expense_category} • ${debt.amount}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPaymentStatusColor(debt.payment_status)}>
                        {getPaymentStatusIcon(debt.payment_status)}
                        <span className="ml-1 capitalize">{debt.payment_status}</span>
                      </Badge>
                      {debt.payment_status === 'submitted' && debt.payment_proof_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDebt(debt)}
                        >
                          Review Proof
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Payment Verification Modal */}
      {selectedDebt && (
        <PaymentVerificationModal
          debt={selectedDebt}
          isOpen={!!selectedDebt}
          onClose={() => setSelectedDebt(null)}
          onVerified={() => {
            setSelectedDebt(null);
            // Refetch data
          }}
        />
      )}
    </>
  );
}