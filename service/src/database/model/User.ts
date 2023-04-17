import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { UsageRecord } from './UsageRecord'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 255 })
  username: string

  @Column({ type: 'varchar', length: 255 })
	realname: string

  @Column({ type: 'varchar', length: 255 })
  password: string

  @Column({ type: 'int' })
  user_usage: number

  @Column({ type: 'int' })
  max_usage: number

  @Column({ type: 'varchar', length: 255 })
  models: string

  @Column({ type: 'varchar', length: 255 })
  last_ip: string

  // 配置关联关系
  @OneToMany(type => UsageRecord, record => record.user)
  records: UsageRecord[]
}
