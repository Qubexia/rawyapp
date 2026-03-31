import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Users, Podcast, ShieldAlert } from 'lucide-react';

export function QuickActions() {
  return (
    <Card className="col-span-1 border-gray-200">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Button variant="secondary" className="w-full justify-start text-left bg-gray-50 hover:bg-gray-100 border border-gray-200">
          <Users className="h-4 w-4 mr-2" /> View Pending Creators
        </Button>
        <Button variant="secondary" className="w-full justify-start text-left bg-gray-50 hover:bg-gray-100 border border-gray-200">
          <Podcast className="h-4 w-4 mr-2" /> Review Reported Podcasts
        </Button>
        <Button variant="danger" className="w-full justify-start text-left mt-2">
          <ShieldAlert className="h-4 w-4 mr-2" /> System Health Check
        </Button>
      </CardContent>
    </Card>
  );
}
