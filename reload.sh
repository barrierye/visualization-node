npm run build
# cd $HOME/.node-red
# yarn add /mnt/d/Graduate1/软工实验/code/visualization-node
ps aux | grep "[n]ode-red" | awk '{system("kill "$2)}'
node-red &