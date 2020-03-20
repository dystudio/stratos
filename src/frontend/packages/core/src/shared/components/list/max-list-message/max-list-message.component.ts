import { Component, EventEmitter, Input, Output } from '@angular/core';

import { NoContentMessageLine } from '../../no-content-message/no-content-message.component';
import { ITableTextMaxed } from '../list-table/table.types';

@Component({
  selector: 'app-max-list-message',
  templateUrl: './max-list-message.component.html',
  styleUrls: ['./max-list-message.component.scss']
})
export class MaxListMessageComponent {

  private pConfig: ITableTextMaxed = {
    icon: 'apps',
    firstLine: 'There are a lot of results'
  };
  @Input()
  set config(config: ITableTextMaxed) {
    if (!config) {
      return;
    }
    this.pConfig = {
      icon: config.icon || this.pConfig.icon,
      firstLine: config.firstLine || this.pConfig.firstLine,
      filterLine: config.filterLine
    };
    // this.otherLines = [{ text: 'Fetching them all will take some time' }];
    this.otherLines = [];
    if (this.config.filterLine) {
      this.otherLines.push(
        { text: this.config.filterLine },
        { text: 'or' }
      );
    }
  }
  get config(): ITableTextMaxed {
    return this.pConfig;
  }


  @Output() showAllAfterMax = new EventEmitter();
  @Input() count = 12345;

  otherLines: NoContentMessageLine[];

  showAll() {
    this.showAllAfterMax.emit();
  }

}
