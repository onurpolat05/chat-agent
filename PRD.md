# Investor Chatbot PRD

## Objective
Web tabanlı PDF ile beslenen yapay zeka asistanıyla yatırımcı etkileşimlerini otomatikleştirme

## Key Features
- PDF tabanlı dinamik bilgi kaynağı
- Oturum bazlı konuşma geçmişi
- Context-aware conversation
- Real-time streaming response
- Session isolation & security

## User Stories
1. Yatırımcı PDF içeriğini sorgulayabilmeli
2. Sohbet geçmişi 5 mesaj sonra otomatik özetlenmeli
3. Kullanıcılar aynı anda 10+ paralel oturum açabilmeli
4. Sistem ayda 50k+ sorgu kapasitesine sahip olmalı

## Technical Requirements
| Metric              | Target              |
|---------------------|---------------------|
| Response Time       | <2s (P95)          |
| Error Rate          | <0.5%              |
| Concurrent Sessions | 500+               |
| Data Retention      | 30 days            |

## Milestones
1. Phase 1: Core RAG Pipeline (2 Weeks)
2. Phase 2: Session Management (1 Week)
3. Phase 3: Monitoring & Analytics (1 Week)