import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      title: 'Booking Confirmed',
      message: 'Your booking at FitPlex Downtown for tomorrow at 6:00 PM is confirmed.',
      timestamp: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      title: 'Special Offer',
      message: 'Get 20% off on annual membership at Elite Fitness. Limited time offer!',
      timestamp: '1 day ago',
      read: true,
    },
    {
      id: 3,
      title: 'Membership Expiring',
      message: 'Your membership at Muscle Zone expires in 5 days. Renew now to avoid interruption.',
      timestamp: '3 days ago',
      read: true,
    },
    {
      id: 4,
      title: 'New Gym Added',
      message: 'PowerHouse Gym has been added near your location. Check it out!',
      timestamp: '5 days ago',
      read: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">Stay updated with your gym activities</p>
        </div>

        {/* Notification List */}
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Card key={notification.id} className="border-muted">
                <CardHeader className="flex items-center justify-between">
                  <div>
                    <CardTitle className={`${!notification.read ? 'font-bold' : 'font-medium'}`}>
                      {notification.title}
                    </CardTitle>
                    <CardDescription>{notification.timestamp}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    ✕
                  </Button>
                </CardHeader>
                <CardContent>
                  <p>{notification.message}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}