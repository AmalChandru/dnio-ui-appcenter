import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs';
import { CommonService } from 'src/app/service/common.service';
import { environment } from 'src/environments/environment';
import { FlowsInteractionService } from '../flows-interaction.service';
import * as _ from 'lodash';

@Component({
  selector: 'odp-flows-interaction-view',
  templateUrl: './flows-interaction-view.component.html',
  styleUrls: ['./flows-interaction-view.component.scss']
})
export class FlowsInteractionViewComponent implements OnInit {

  interactionData: any;
  flowData: any;
  interactionStateList: Array<any>;
  selectedNodeId: string;
  breadcrumb: Array<any>;
  txnId: string;
  remoteTxnId: string;
  constructor(private commonService: CommonService,
    private route: ActivatedRoute,
    private flowsService: FlowsInteractionService) {
    this.interactionData = {
      headers: {}
    };
    this.interactionStateList = [];
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.route.data.subscribe(data => {
        if (data.breadcrumb) {
          this.breadcrumb = _.cloneDeep(data.breadcrumb)
          this.commonService.get('pm', `/${this.commonService.app._id}/flow/` + params.flowId).subscribe(res => {
            this.breadcrumb.push(res.name)
            this.breadcrumb.push(params.interactionId)
            this.commonService.breadcrumbPush(this.breadcrumb)
          })
        }
      })
      this.getInteractions(params);
    });
  }

  getInteractions(params: any) {
    combineLatest([
      this.commonService.get('pm', `/${this.commonService.app._id}/interaction/${params.flowId}/${params.interactionId}`),
      this.commonService.get('pm', `/${this.commonService.app._id}/interaction/${params.flowId}/${params.interactionId}/state`),
      this.commonService.get('pm', `/${this.commonService.app._id}/flow/${params.flowId}`)
    ]).subscribe(res => {
      this.interactionData = res[0];
      this.interactionStateList = res[1];
      this.flowData = res[2];

      if (this.interactionData.headers && !_.isEmpty(this.interactionData.headers)) {
        this.txnId = this.interactionData.headers['data-stack-txn-id'];
        this.remoteTxnId = this.interactionData.headers['data-stack-remote-txn-id'];
      } else {
        this.txnId = this.interactionData.txnId;
        this.remoteTxnId = this.interactionData.remoteTxnId;
      }

      this.selectedNodeId = this.flowData.inputNode._id;
      if (!environment.production) {
        console.log(res);
      }
      this.flowData.inputNode.interactionId = this.interactionData._id;
      const temp = this.interactionStateList.find(e => e.nodeId == this.flowData.inputNode._id);
      if (temp) {
        this.flowData.inputNode.state = temp;
      }
      this.flowData.nodes.forEach((node: any) => {
        const temp = this.interactionStateList.find(e => e.nodeId == node._id);
        if (temp) {
          node.state = temp;
        }
        node.interactionId = this.interactionData._id;
      });
    }, err => {
      console.error(err);
    })
  }

  getContentType(contentType: string) {
    return this.flowsService.getContentType(contentType);
  }

  getStatusClass(item: any) {
    if (item) {
      return this.flowsService.getStatusClass(item);
    }
  }

  getStatusBadgeClass(item: any) {
    if (item) {
      return this.flowsService.getStatusBadgeClass(item);
    }
  }

  getStatusClassSuffix(item: any) {
    if (item) {
      return this.flowsService.getStatusClassSuffix(item);
    }
  }

  getNextNode(node: any) {
    return (this.flowData.nodes || []).find(e => e._id == node._id);
  }

  getDuration(startTime: string, endTime: string) {
    return this.flowsService.getDuration(startTime, endTime);
  }

  hasError(nodeId: string) {
    const temp = this.interactionStateList.find(e => e.nodeId == nodeId);
    if (temp && temp.status === 'ERROR') {
      return true;
    }
    return false;
  }

  hasExecuted(nodeId: string) {
    const temp = this.interactionStateList.find(e => e.nodeId == nodeId);
    if (temp) {
      return true;
    }
    return false;
  }

  onNodeChange(value, checkPrevious = false) {
    // const nodeDetails = (checkPrevious ? this.prevNodes : this.nextNodes).find(node => node.name === value);
    this.selectedNodeId = value;

  }

  get nodeList() {
    let nodes = [];
    if (this.flowData && this.flowData.inputNode) {
      nodes.push(this.flowData.inputNode);
    }
    if (this.flowData && this.flowData.nodes) {
      nodes = nodes.concat(this.flowData.nodes.filter(e => e.state));
    }
    nodes.sort((a, b) => {
      return new Date(a.state._metadata.createdAt).getTime() - new Date(b.state._metadata.createdAt).getTime();
    });
    return nodes;
  }

  get nextNodes() {
    const index = this.nodeList.findIndex(e => e._id == this.selectedNodeId)
    return this.nodeList[index + 1]
  }
  get prevNodes() {
    const index = this.nodeList.findIndex(e => e._id == this.selectedNodeId)
    return this.nodeList[index - 1]
  }
}
