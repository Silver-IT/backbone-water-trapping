$(function(){
    // jQuery: $, Lodash: _, JointJS: joint
    const WaterPoolModel = Backbone.Model.extend({
        defaults: {
            minLength: 4,
            maxLength: 15,
            maxHeight: 10,
            heights: [4, 2, 0, 3, 2, 5],
            length: 6,
        },
        refresh: function() {
            const lengthDifference = this.get('maxLength') - this.get('minLength');
            const nLength = this.get('minLength') + parseInt(lengthDifference * Math.random());
            this.set('nLength', nLength);
            const heights = [], maxHeight = this.get('maxHeight');
            for (let i = 0; i < nLength; i++) {
                heights.push(parseInt(maxHeight * Math.random()));
            }
            this.set('heights', heights);
        },
        trap: function() {
            const heights = this.get('heights');
            const n = heights.length;
            if (n < 3) return 0;
    
            let leftMax = [0], rightMax = [0];
    
            for(let i = 1; i < n - 1; i++)
            {
                leftMax.push(Math.max(leftMax[i - 1], heights[i - 1]));
                rightMax.unshift(Math.max(rightMax[0], heights[n - i]));
            }
            leftMax.push(0);
            rightMax.unshift(0);
    
            let waterLevels = [];
            for (let i = 1; i < n - 1; i++)
                waterLevels.push(Math.max(0, Math.min(leftMax[i], rightMax[i]) - heights[i]));

            return { waterLevels, trap: waterLevels.reduce((a, b) => a + b)};
        }
    });

    const WaterPoolView = Backbone.View.extend({
        template: Handlebars.compile($("#water-pool-template").html()),
        model: new WaterPoolModel(),
        events: {
            "click #btn-generate": "refreshWaterPoolModel",
            "click #btn-test": "onClickTestButton",
        },
        refreshWaterPoolModel: function() {
          this.model.refresh();
        },
        onClickTestButton: function() {
          console.log(_.concat([1, 3, 5], [2, 4]));
        },
        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);

            this.graph = new joint.dia.Graph;
            this.paper = new joint.dia.Paper({
                el: $('#water-pool').first(),
                model: this.graph,
                width: 1000,
                height: 750,
                gridSize: 1
            });

            this.render();
        },
        drawLines: function() {
            var ptCenter = new joint.shapes.standard.Circle();
            ptCenter.position(50, 700);
            ptCenter.resize(0, 0);
            ptCenter.addTo(this.graph);

            var ptTop = ptCenter.clone();
            ptTop.translate(0, -650);
            ptTop.addTo(this.graph);

            var lnVertical = new joint.shapes.standard.Link();
            lnVertical.source(ptCenter);
            lnVertical.target(ptTop);
            lnVertical.addTo(this.graph);

            var ptRight = ptCenter.clone();
            ptRight.translate(900, 0);
            ptRight.addTo(this.graph);

            var lnHorizontal = lnVertical.clone();
            lnHorizontal.target(ptRight);
            lnHorizontal.addTo(this.graph);
        },
        drawBlocks: function() {
            const heights = this.model.get('heights');
            const blockModel = new joint.shapes.standard.Rectangle();
            blockModel.resize(60, 60);
            blockModel.attr({ body: { fill: 'gray' } });
            for (let i = 0; i < heights.length; i++) {
                const height = heights[i];
                if (height) {
                    for (let j = 0; j < height; j++) {
                        const block = blockModel.clone(0);
                        block.position(50 + 60 * i, 700 - 60 * (j + 1));
                        block.addTo(this.graph);
                    }
                }
            }
        },
        drawWater: function() {
            const waterLevels = this.model.trap().waterLevels;
            console.log(waterLevels);
        },
        drawDiagram: function() {
            // 60 * 60
            this.graph.clear();
            this.drawLines();
            this.drawBlocks();
            this.drawWater();
        },
        render: function () {
            this.$el.html(this.template({
                heights: `[${this.model.get('heights').join(', ')}]`,
                trap: this.model.trap().trap
            }));
            this.drawDiagram();
        }
    });
    
    const AppRouter = Backbone.Router.extend({
        routes: {
            '': 'waterPoolRoute',
        },
        waterPoolRoute: function () {
            $("#water-pool-description").html(new WaterPoolView().el);
        },
    });
    
    var appRouter = new AppRouter();
    Backbone.history.start();
})