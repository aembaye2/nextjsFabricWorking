import matplotlib.pyplot as plt

# Create a figure and axis
fig, ax = plt.subplots()

# Define the point coordinates
point_x = 2
point_y = 3


# Plot dashed lines to the x-axis and y-axis
ax.plot([point_x, point_x], [0, point_y], 'k--',
        linewidth=12)  # Vertical dashed line
ax.plot([0, point_x], [point_y, point_y], 'k--',
        linewidth=12)  # Horizontal dashed line

# Plot the point
# 'ro' means red color and circle marker, markersize=10 for larger size
ax.plot(point_x, point_y, 'ro', markersize=40)

# Set the limits of the plot
ax.set_xlim(0, point_x + 1)
ax.set_ylim(0, point_y + 1)

# Remove the axes for icon-like appearance
ax.axis('off')

# Save the figure as a .png file to the current drive
plt.savefig('./public/coord_icon2.png',
            bbox_inches='tight', pad_inches=0, dpi=100)

# Show the plot
# plt.show()
