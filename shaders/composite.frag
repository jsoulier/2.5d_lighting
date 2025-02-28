#version 450

layout(location = 0) in vec2 i_uv;
layout(location = 0) out vec4 o_color;
layout(set = 2, binding = 0) uniform sampler2D s_color;
layout(set = 2, binding = 1) uniform sampler2D s_position;
layout(set = 2, binding = 2) uniform sampler2D s_normal;
layout(set = 2, binding = 3) uniform sampler2D s_light;

vec4 get_light(
    const vec3 position)
{
    const int kernel = 3;
    const vec2 size = 1.0f / vec2(textureSize(s_normal, 0));
    vec4 light = vec4(0.0f);
    for (int x = -kernel; x <= kernel; x++)
    {
        for (int y = -kernel; y <= kernel; y++)
        {
            const vec2 neighbor_uv = i_uv + vec2(x, y) * size;
            const vec3 neighbor_position = texture(s_position, neighbor_uv).xyz;
            if (abs(position.y - neighbor_position.y) < 1.0f)
            {
                light += texture(s_light, neighbor_uv);
            }
            else
            {
                light += texture(s_light, i_uv);
            }
        }
    }
    light /= (kernel * 2 + 1) * (kernel * 2 + 1);
    return light;
}

float get_ssao(
    const vec4 color,
    const vec3 position,
    const vec3 normal)
{
    const int kernel = 3;
    const vec2 size = 1.0f / vec2(textureSize(s_normal, 0));
    float ssao = 0.0f;
    for (int x = -kernel; x <= kernel; x++)
    {
        for (int y = -kernel; y <= kernel; y++)
        {
            const vec2 neighbor_uv = i_uv + vec2(x, y) * size;
            const vec3 neighbor_normal = texture(s_normal, neighbor_uv).xyz;
            const vec4 neighbor_color = texture(s_color, neighbor_uv);
            const vec3 neighbor_position = texture(s_position, neighbor_uv).xyz;
            if ((dot(normal, neighbor_normal) < 0.9f) ||
                (distance(color, neighbor_color) > 0.1f) || (normal.y > 0.9f &&
                (abs(position.y - neighbor_position.y) > 0.1f)))
            {
                ssao += 1.0f;
            }
        }
    }
    ssao /= (kernel * 2 + 1) * (kernel * 2 + 1);
    return ssao;
}

void main()
{
    const vec4 color = texture(s_color, i_uv);
    const vec3 position = texture(s_position, i_uv).xyz;
    const vec3 normal = texture(s_normal, i_uv).xyz;
    const vec4 light = get_light(position);
    const float ssao = get_ssao(color, position, normal);
    const float intensity = clamp(light.a / 1.5f, 0.0f, 1.0f);
    const vec3 base = color.rgb * intensity;
    o_color = vec4(mix(base, light.rgb, intensity), 1.0f) - ssao / 8.0f;
}