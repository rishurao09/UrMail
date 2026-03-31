"""
UrMail Mock Data — Realistic sample emails and knowledge base content for demos.
"""
from datetime import datetime, timedelta
from app.models import Email

MOCK_EMAILS: list[dict] = [
    {
        "id": "email_001",
        "sender": "Sarah Johnson",
        "sender_email": "sarah.johnson@acmecorp.com",
        "subject": "Urgent: Order #4521 Not Delivered",
        "body": "Hello,\n\nI placed order #4521 five days ago and it still hasn't arrived. The tracking page shows 'In Transit' but hasn't updated since Monday. This is extremely urgent as I need these supplies for a client meeting on Friday.\n\nPlease provide an immediate update or arrange for express re-shipment.\n\nThank you,\nSarah Johnson\nVP of Operations, Acme Corp",
        "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(),
    },
    {
        "id": "email_002",
        "sender": "Mike Chen",
        "sender_email": "mike.chen@techstartup.io",
        "subject": "Partnership Opportunity - AI Integration",
        "body": "Hi there,\n\nI'm the CTO at TechStartup and I've been following your AI email agent product with great interest. We're looking to integrate an intelligent email routing solution into our enterprise SaaS platform.\n\nWould you be available for a call next week to discuss potential partnership opportunities? We're looking at a potential deal worth $500K annually.\n\nBest regards,\nMike Chen\nCTO, TechStartup",
        "timestamp": (datetime.now() - timedelta(hours=5)).isoformat(),
    },
    {
        "id": "email_003",
        "sender": "Emily Davis",
        "sender_email": "emily.d@gmail.com",
        "subject": "Quick question about return policy",
        "body": "Hi,\n\nI bought a laptop bag from your store last week but it's slightly smaller than I expected. What's your return policy? Can I exchange it for a larger size?\n\nThanks,\nEmily",
        "timestamp": (datetime.now() - timedelta(hours=8)).isoformat(),
    },
    {
        "id": "email_004",
        "sender": "System Notification",
        "sender_email": "noreply@spam-offers.com",
        "subject": "🎉 YOU WON $10,000,000! Click Here NOW!!!",
        "body": "CONGRATULATIONS!!! You have been selected as the lucky winner of our international lottery program. Click the link below to claim your $10,000,000 prize money immediately!\n\nhttp://totally-legit-prize.scam/claim\n\nThis offer expires in 24 hours! ACT NOW!",
        "timestamp": (datetime.now() - timedelta(hours=10)).isoformat(),
    },
    {
        "id": "email_005",
        "sender": "David Park",
        "sender_email": "david.park@enterprise.com",
        "subject": "Contract Renewal Discussion",
        "body": "Hello,\n\nOur current enterprise license is set to expire next month. Before we proceed with renewal, I'd like to schedule a meeting to discuss:\n\n1. Updated pricing for 500+ seats\n2. New features in the latest release\n3. SLA improvements\n4. Custom integration support\n\nOur budget committee meets on March 15th, so I'd appreciate an early response.\n\nRegards,\nDavid Park\nHead of IT, Enterprise Solutions Inc.",
        "timestamp": (datetime.now() - timedelta(hours=12)).isoformat(),
    },
    {
        "id": "email_006",
        "sender": "Jessica Miller",
        "sender_email": "jessica.m@customersupport.org",
        "subject": "Can't access my account after password reset",
        "body": "Hi Support,\n\nI tried resetting my password this morning but now I can't log in at all. I keep getting an 'Invalid credentials' error. I've tried:\n\n- Clearing browser cache\n- Using a different browser\n- Resetting password again\n\nNothing works. My account email is jessica.m@customersupport.org and I need access urgently for work.\n\nPlease help ASAP!\n\nJessica Miller",
        "timestamp": (datetime.now() - timedelta(hours=1)).isoformat(),
    },
    {
        "id": "email_007",
        "sender": "Alex Rivera",
        "sender_email": "alex@personalmail.com",
        "subject": "Happy Birthday! 🎂",
        "body": "Hey!\n\nJust wanted to wish you a very happy birthday! Hope you have an amazing day filled with joy and celebration.\n\nLet's grab dinner this weekend to celebrate — my treat!\n\nCheers,\nAlex",
        "timestamp": (datetime.now() - timedelta(hours=3)).isoformat(),
    },
    {
        "id": "email_008",
        "sender": "Priya Sharma",
        "sender_email": "priya.sharma@bigclient.com",
        "subject": "CRITICAL: Production system down",
        "body": "URGENT - Our production system integrated with your API has been down for 2 hours. We're losing approximately $50,000 per hour in revenue.\n\nError logs show: 'Connection refused on port 8443'\n\nWe need immediate escalation to your engineering team. This is a P0 incident.\n\nPriya Sharma\nDirector of Engineering, BigClient Corp\nPhone: +1-555-0199",
        "timestamp": (datetime.now() - timedelta(minutes=30)).isoformat(),
    },
    {
        "id": "email_009",
        "sender": "Newsletter Bot",
        "sender_email": "deals@cheapdeals247.com",
        "subject": "🔥 MASSIVE SALE - 90% OFF Everything! Limited Time!",
        "body": "Don't miss out on our BIGGEST SALE EVER!\n\n90% OFF all products\nFREE shipping worldwide\nBuy 1 Get 10 FREE\n\nUse code: SCAM2024\n\nClick here: http://cheapdeals247.com/sale\n\nUnsubscribe: http://cheapdeals247.com/never",
        "timestamp": (datetime.now() - timedelta(hours=6)).isoformat(),
    },
    {
        "id": "email_010",
        "sender": "Robert Kim",
        "sender_email": "robert.kim@mediumco.com",
        "subject": "Inquiry about bulk pricing",
        "body": "Hello Sales Team,\n\nWe're a mid-size company looking to purchase licenses for approximately 50 team members. Could you please provide:\n\n1. Bulk pricing details\n2. Volume discounts\n3. Implementation timeline\n4. Training resources available\n\nWe're comparing 3 vendors and plan to make a decision by end of this month.\n\nBest,\nRobert Kim\nProcurement Manager",
        "timestamp": (datetime.now() - timedelta(hours=4)).isoformat(),
    },
]


# Knowledge Base sample content for demo
SAMPLE_FAQ_CONTENT = """
## Delivery & Shipping FAQ

Q: How long does standard delivery take?
A: Standard delivery takes 3-5 business days within the continental US. International orders may take 7-14 business days.

Q: Can I track my order?
A: Yes! Once your order ships, you'll receive a tracking number via email. You can track your package at tracking.urmail.com.

Q: What if my order hasn't arrived?
A: If your order hasn't arrived within the expected delivery window, please contact our support team. We'll investigate and either locate your package or arrange a replacement shipment. For orders delayed beyond 7 business days domestically, we offer express re-shipment at no additional cost.

Q: Do you offer express shipping?
A: Yes, we offer express (1-2 business days) and overnight shipping options at checkout.

## Return Policy

Q: What is your return policy?
A: We offer a 30-day return policy for all unused items in original packaging. Simply initiate a return through your account dashboard or contact support. Refunds are processed within 5-7 business days after we receive the returned item.

Q: Can I exchange an item?
A: Yes! Exchanges are free for the first exchange. Contact support with your order number and the item you'd like to exchange for.

Q: What items cannot be returned?
A: Customized items, perishable goods, and digital downloads are non-returnable.

## Account & Technical Support

Q: How do I reset my password?
A: Click "Forgot Password" on the login page, enter your email, and follow the reset link sent to your inbox. The link expires in 24 hours. If you continue to have issues after resetting, try clearing your browser cache or using an incognito window.

Q: I can't log in after a password reset. What should I do?
A: First, ensure you're using the most recent reset link (check for multiple emails). Clear your browser cache and cookies, then try again. If the issue persists, our support team can manually reset your account — contact us with your registered email address.

Q: How do I update my billing information?
A: Log into your account, go to Settings > Billing, and update your payment method. Changes take effect on your next billing cycle.

## Pricing & Plans

Q: What pricing plans do you offer?
A: We offer three tiers:
- Starter: $29/month (up to 10 users)
- Professional: $79/month (up to 50 users)
- Enterprise: Custom pricing (unlimited users, dedicated support)

Q: Do you offer bulk discounts?
A: Yes! For orders of 50+ licenses, we offer 15% volume discounts. For 100+ licenses, discounts of 25% are available. Contact our sales team for a custom quote.

Q: Is there a free trial?
A: Yes, we offer a 14-day free trial with full access to Professional features. No credit card required.
"""

SAMPLE_POLICIES_CONTENT = """
## Company Policies

### Service Level Agreement (SLA)
- Uptime guarantee: 99.9%
- Response time for P0 incidents: 15 minutes
- Response time for P1 incidents: 1 hour
- Response time for P2 incidents: 4 hours
- Response time for P3 incidents: 1 business day

### Escalation Procedures
- P0 (Critical): Immediate phone escalation to on-call engineering team
- P1 (High): Slack notification + email to engineering lead
- P2 (Medium): Ticket created in tracking system, addressed within SLA
- P3 (Low): Added to backlog, addressed in priority order

### Data Security
- All data encrypted at rest (AES-256) and in transit (TLS 1.3)
- SOC 2 Type II certified
- GDPR compliant
- Annual third-party security audits

### Support Hours
- Standard support: Monday-Friday, 9 AM - 6 PM EST
- Premium support: 24/7 with dedicated account manager
- Emergency hotline: Available for Enterprise customers
"""

# VIP / Important senders for priority scoring
IMPORTANT_SENDERS = [
    "acmecorp.com",
    "bigclient.com",
    "enterprise.com",
    "techstartup.io",
]

URGENCY_KEYWORDS = [
    "urgent", "asap", "immediately", "critical", "emergency",
    "deadline", "p0", "production down", "revenue loss", "escalation",
    "time-sensitive", "priority", "blocking", "incident",
]
