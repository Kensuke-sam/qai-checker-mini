## numbers

| issue | a | b | location |
|---|---|---|---|
| - ダウンタイムは最大___間とする | 4時 | 8時 | A:L14 / B:L14 |
| - データ移行量は約___ | 2.5TB | 3.0TB | A:L13 / B:L13 |
| - 現行システムの稼働率は___を維持する | 99.9% | 99.95% | A:L12 / B:L12 |
| 対象サーバ台数: ___ | 12台 | 15台 | A:L6 / B:L6 |
| 総予算: ___ | 15,000,000円 | 18,000,000円 | A:L8 / B:L8 |

## missing

### headings_only_in_a

- システム移行計画書

### headings_only_in_b

- Phase 4: 運用安定化（10月）
- システム移行計画

### steps_only_in_a

- AWSアカウントのセットアップ
- DNSの切り替え
- IaC: Terraform
- コンピュート: EC2 (m5.xlarge)
- ストレージ: S3, EBS
- ダウンタイムは最大4時間とする
- データベース: RDS (PostgreSQL 15)
- データベース移行テスト
- データ移行量は約2.5TB
- 現行システムの稼働率は99.9%を維持する

### steps_only_in_b

- DNS切り替え
- IaC: Tarraform
- コンピュート: EC2 (m5.2xlarge)
- ストレージ: Amazon S3, EBS
- ダウンタイムは最大8時間とする
- データベース: RDS (Postgres 15)
- データベースマイグレーションテスト
- データ移行量は約3.0TB
- 現行システムの稼働率は99.95%を維持する
- 負荷テスト実施
- 運用手順書の整備
- 障害対応訓練

## terminology

| term_a | term_b | similarity |
|---|---|---|
| PostgreSQL | Postgres | 0.889 |
| Terraform | Tarraform | 0.889 |
