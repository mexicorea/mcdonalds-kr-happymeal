import * as events from 'aws-cdk-lib/aws-events'

import { Construct } from 'constructs'

export class EventConstruct extends Construct {
  public eventRule: events.Rule
  constructor(scope: Construct, id: string, cron: string) {
    super(scope, id)

    this.eventRule = new events.Rule(this, id, {
      schedule: events.Schedule.expression(cron)
    })
  }
}
