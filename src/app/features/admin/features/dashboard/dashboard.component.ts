import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats = {
    totalUsers: 1247,
    totalProducts: 89,
    totalOrders: 567,
    revenue: 45680
  };

  recentOrders = [
    { id: '#001', customer: 'John Doe', amount: 299.99, status: 'completed' },
    { id: '#002', customer: 'Jane Smith', amount: 159.99, status: 'pending' },
    { id: '#003', customer: 'Mike Johnson', amount: 89.99, status: 'shipped' },
    { id: '#004', customer: 'Sarah Wilson', amount: 199.99, status: 'completed' }
  ];

  getStatusClass(status: string): string {
    switch(status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'shipped': return 'info';
      default: return 'secondary';
    }
  }
  constructor() { }

  ngOnInit(): void {
  }

  protected readonly Date = Date;
}
