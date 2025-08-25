import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target,
  PieChart as PieChartIcon,
  BarChart3,
  Calculator,
  Lightbulb
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BudgetCategory {
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentage: number;
  color: string;
  items: Array<{
    name: string;
    amount: number;
    date: string;
    status: 'paid' | 'pending' | 'overdue';
  }>;
}

interface BudgetData {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  categories: BudgetCategory[];
  projectedExpenses: Array<{
    date: string;
    amount: number;
    category: string;
  }>;
  recommendations: Array<{
    type: 'warning' | 'suggestion' | 'optimization';
    message: string;
    impact: number;
  }>;
}

interface SmartBudgetAllocationProps {
  tripId: string;
  tripBudget?: number;
}

const CATEGORY_COLORS = {
  'accommodation': '#3B82F6',
  'food': '#10B981', 
  'transportation': '#F59E0B',
  'activities': '#8B5CF6',
  'shopping': '#EF4444',
  'entertainment': '#06B6D4',
  'other': '#6B7280'
};

export const SmartBudgetAllocation = ({ tripId, tripBudget = 5000 }: SmartBudgetAllocationProps) => {
  const { toast } = useToast();
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'categories' | 'projections' | 'recommendations'>('overview');

  useEffect(() => {
    fetchBudgetData();
  }, [tripId]);

  const fetchBudgetData = async () => {
    setLoading(true);
    try {
      // Fetch expenses for the trip
      const expensesRes = await fetch(`/api/trips/${tripId}/expenses`);
      const expenses = expensesRes.ok ? await expensesRes.json() : [];

      // Fetch activities for projected costs
      const activitiesRes = await fetch(`/api/trips/${tripId}/activities`);
      const activities = activitiesRes.ok ? await activitiesRes.json() : [];

      // Process data into budget categories
      const processedData = processBudgetData(expenses, activities, tripBudget);
      setBudgetData(processedData);
    } catch (error) {
      console.error('Error fetching budget data:', error);
      toast({
        title: "Error loading budget data",
        description: "Unable to load budget information.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processBudgetData = (expenses: any[], activities: any[], totalBudget: number): BudgetData => {
    // Group expenses by category
    const categoryMap = new Map<string, any>();
    
    expenses.forEach(expense => {
      const category = expense.category || 'other';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          spent: 0,
          items: [],
          color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.other
        });
      }
      
      const categoryData = categoryMap.get(category);
      categoryData.spent += parseFloat(expense.amount || 0);
      categoryData.items.push({
        name: expense.description || expense.title,
        amount: parseFloat(expense.amount || 0),
        date: expense.created_at,
        status: expense.is_paid ? 'paid' : 'pending'
      });
    });

    // Add projected costs from activities
    activities.forEach(activity => {
      const category = activity.category === 'attraction' ? 'activities' : activity.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          spent: 0,
          items: [],
          color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.other
        });
      }
      
      const categoryData = categoryMap.get(category);
      if (activity.status === 'approved' && activity.estimated_cost) {
        categoryData.items.push({
          name: activity.title,
          amount: parseFloat(activity.estimated_cost),
          date: activity.created_at,
          status: 'pending'
        });
      }
    });

    // Calculate allocations and remaining budgets
    const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const categories: BudgetCategory[] = Array.from(categoryMap.values()).map(cat => {
      const allocated = Math.max(cat.spent * 1.2, totalBudget * 0.1); // Smart allocation
      const remaining = allocated - cat.spent;
      const percentage = (cat.spent / totalSpent) * 100;
      
      return {
        ...cat,
        allocated,
        remaining,
        percentage: isNaN(percentage) ? 0 : percentage
      };
    });

    // Generate projections
    const projectedExpenses = generateProjections(categories);
    
    // Generate recommendations
    const recommendations = generateRecommendations(categories, totalBudget, totalSpent);

    return {
      totalBudget,
      totalSpent,
      totalRemaining: totalBudget - totalSpent,
      categories,
      projectedExpenses,
      recommendations
    };
  };

  const generateProjections = (categories: BudgetCategory[]) => {
    const projections = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      categories.forEach(cat => {
        if (cat.remaining > 0) {
          const dailyBurn = cat.spent / 30; // Estimate daily burn rate
          projections.push({
            date: date.toISOString().split('T')[0],
            amount: dailyBurn,
            category: cat.category
          });
        }
      });
    }
    
    return projections.slice(0, 50); // Limit projections
  };

  const generateRecommendations = (categories: BudgetCategory[], totalBudget: number, totalSpent: number) => {
    const recommendations = [];
    
    // Budget utilization warnings
    const utilizationRate = totalSpent / totalBudget;
    if (utilizationRate > 0.8) {
      recommendations.push({
        type: 'warning' as const,
        message: `You've spent ${(utilizationRate * 100).toFixed(1)}% of your budget. Consider reducing expenses.`,
        impact: utilizationRate
      });
    }
    
    // Category-specific recommendations
    categories.forEach(cat => {
      if (cat.spent > cat.allocated) {
        recommendations.push({
          type: 'warning' as const,
          message: `${cat.category} category is over budget by $${(cat.spent - cat.allocated).toFixed(2)}`,
          impact: (cat.spent - cat.allocated) / cat.allocated
        });
      }
      
      if (cat.remaining > cat.allocated * 0.5) {
        recommendations.push({
          type: 'suggestion' as const,
          message: `You have significant budget remaining in ${cat.category}. Consider upgrading experiences.`,
          impact: cat.remaining / cat.allocated
        });
      }
    });
    
    // Optimization suggestions
    if (totalSpent < totalBudget * 0.6) {
      recommendations.push({
        type: 'optimization' as const,
        message: 'You\'re under budget! Consider adding premium activities or upgrading accommodations.',
        impact: 0.3
      });
    }
    
    return recommendations.sort((a, b) => b.impact - a.impact);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Smart Budget Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!budgetData) return null;

  const BudgetOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">${budgetData.totalBudget.toLocaleString()}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Spent</p>
                <p className="text-2xl font-bold">${budgetData.totalSpent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  {((budgetData.totalSpent / budgetData.totalBudget) * 100).toFixed(1)}% used
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold">${budgetData.totalRemaining.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  {((budgetData.totalRemaining / budgetData.totalBudget) * 100).toFixed(1)}% left
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Spent: ${budgetData.totalSpent.toLocaleString()}</span>
              <span>Remaining: ${budgetData.totalRemaining.toLocaleString()}</span>
            </div>
            <Progress 
              value={(budgetData.totalSpent / budgetData.totalBudget) * 100} 
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetData.categories}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="spent"
                  label={({ category, percentage }) => `${category}: ${percentage.toFixed(1)}%`}
                >
                  {budgetData.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spent']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const CategoryDetails = () => (
    <div className="space-y-4">
      {budgetData.categories.map((category, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="capitalize flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: category.color }}
                />
                {category.category}
              </CardTitle>
              <Badge variant={category.spent > category.allocated ? "destructive" : "secondary"}>
                ${category.spent.toLocaleString()} / ${category.allocated.toLocaleString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress 
                value={(category.spent / category.allocated) * 100} 
                className="h-2"
              />
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Allocated</p>
                  <p className="font-semibold">${category.allocated.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Spent</p>
                  <p className="font-semibold">${category.spent.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Remaining</p>
                  <p className="font-semibold">${category.remaining.toLocaleString()}</p>
                </div>
              </div>

              {category.items.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Recent Items:</p>
                  {category.items.slice(0, 3).map((item, itemIndex) => (
                    <div key={itemIndex} className="flex justify-between items-center text-sm">
                      <span>{item.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.status === 'paid' ? 'default' : 'outline'}>
                          {item.status}
                        </Badge>
                        <span>${item.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  {category.items.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{category.items.length - 3} more items
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const Recommendations = () => (
    <div className="space-y-4">
      {budgetData.recommendations.map((rec, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {rec.type === 'warning' && <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />}
              {rec.type === 'suggestion' && <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5" />}
              {rec.type === 'optimization' && <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />}
              
              <div className="flex-1">
                <Badge className="mb-2" variant={
                  rec.type === 'warning' ? 'destructive' : 
                  rec.type === 'suggestion' ? 'default' : 'secondary'
                }>
                  {rec.type}
                </Badge>
                <p className="text-sm">{rec.message}</p>
                <div className="mt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Impact:</span>
                    <Progress value={rec.impact * 100} className="h-1 w-20" />
                    <span>{(rec.impact * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {budgetData.recommendations.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Lightbulb className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Great Job!</h3>
            <p className="text-muted-foreground">
              Your budget is well-balanced. No immediate recommendations at this time.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Smart Budget Allocation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="projections" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Projections
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <BudgetOverview />
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <CategoryDetails />
          </TabsContent>

          <TabsContent value="projections" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Spending Projections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={budgetData.projectedExpenses.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Projected Spend']} />
                      <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="mt-6">
            <Recommendations />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};