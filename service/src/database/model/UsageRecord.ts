import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from './User'

@Entity('usage_records')
export class UsageRecord {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 255 })
  usage_date: string

  @Column({ type: 'varchar', length: 255 })
  model: string

  @Column({ type: 'int' })
  usage_amount: number

  // 配置关联关系
  @ManyToOne(type => User, user => user.records)
  @JoinColumn({ name: 'user_id' })
  user: User
}
